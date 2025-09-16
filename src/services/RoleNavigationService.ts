import { SafeFirestoreService } from './SafeFirestoreService';

export type UserRole = 'customer' | 'owner' | null;

export interface RoleCheckResult {
  role: UserRole;
  success: boolean;
  error?: string;
}

export class RoleNavigationService {
  private static instance: RoleNavigationService;
  private safeFirestore: SafeFirestoreService;

  private constructor() {
    this.safeFirestore = SafeFirestoreService.getInstance();
  }

  static getInstance(): RoleNavigationService {
    if (!RoleNavigationService.instance) {
      RoleNavigationService.instance = new RoleNavigationService();
    }
    return RoleNavigationService.instance;
  }

  async getUserRole(userId: string): Promise<RoleCheckResult> {
    try {
      console.log('RoleNavigationService: Determining role for user:', userId);
      
      const userProfile = await this.getUserProfileWithRole(userId);
      if (userProfile?.role) {
        console.log('RoleNavigationService: Role found in user profile:', userProfile.role);
        return { role: userProfile.role, success: true };
      }

      const roleFromCollections = await this.getRoleFromCollections(userId);
      if (roleFromCollections.role) {
        console.log('RoleNavigationService: Role determined from collections:', roleFromCollections.role);
        
        await this.updateUserProfileWithRole(userId, roleFromCollections.role);
        
        return roleFromCollections;
      }

      console.log('RoleNavigationService: No role found, defaulting to customer');
      return { role: 'customer', success: true };

    } catch (error) {
      console.error('RoleNavigationService: Error determining user role:', error);
      return { 
        role: 'customer',
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  private async getUserProfileWithRole(userId: string): Promise<{ role?: UserRole } | null> {
    try {
      const doc = await this.safeFirestore.getFirestore()
        .collection('users')
        .doc(userId)
        .get();
      
      if (doc.exists) {
        const data = doc.data();
        return { role: data?.role as UserRole };
      }
      return null;
    } catch (error) {
      console.warn('RoleNavigationService: Could not get user profile with role:', error);
      return null;
    }
  }

  private async getRoleFromCollections(userId: string): Promise<RoleCheckResult> {
    try {
      const ownerDoc = await this.safeFirestore.getFirestore()
        .collection('ownerProfiles')
        .doc(userId)
        .get();
      
      if (ownerDoc.exists) {
        console.log('RoleNavigationService: Found owner profile');
        return { role: 'owner', success: true };
      }

      const customerDoc = await this.safeFirestore.getFirestore()
        .collection('customerProfiles')
        .doc(userId)
        .get();
      
      if (customerDoc.exists) {
        console.log('RoleNavigationService: Found customer profile');
        return { role: 'customer', success: true };
      }

      return { role: null, success: true };
    } catch (error) {
      console.error('RoleNavigationService: Error checking role collections:', error);
      return { 
        role: null, 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  private async updateUserProfileWithRole(userId: string, role: UserRole): Promise<void> {
    try {
      await this.safeFirestore.getFirestore()
        .collection('users')
        .doc(userId)
        .update({ 
          role,
          roleUpdatedAt: new Date().toISOString()
        });
      
      console.log('RoleNavigationService: Updated user profile with role:', role);
    } catch (error) {
      console.warn('RoleNavigationService: Could not update user profile with role:', error);
    }
  }

  hasRoleAccess(userRole: UserRole, requiredRole: UserRole): boolean {
    if (!userRole || !requiredRole) return false;
    return userRole === requiredRole;
  }

  getNavigationComponent(role: UserRole): 'customer' | 'owner' {
    return role === 'owner' ? 'owner' : 'customer';
  }
}
