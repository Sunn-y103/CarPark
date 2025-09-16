import { RoleNavigationService } from '../services/RoleNavigationService';
import { SafeFirestoreService } from '../services/SafeFirestoreService';
import auth from '@react-native-firebase/auth';

export class RoleNavigationTest {
  private roleService: RoleNavigationService;
  private firestore: SafeFirestoreService;

  constructor() {
    this.roleService = RoleNavigationService.getInstance();
    this.firestore = SafeFirestoreService.getInstance();
  }

  async testCurrentUserRole(): Promise<void> {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      console.error('❌ No authenticated user found for role testing');
      return;
    }

    console.log('🧪 Testing role detection for user:', currentUser.uid);
    
    try {
      const roleResult = await this.roleService.getUserRole(currentUser.uid);
      
      if (roleResult.success) {
        console.log('✅ Role detection successful!');
        console.log('👤 User role:', roleResult.role);
        console.log('🧭 Recommended navigation:', this.roleService.getNavigationComponent(roleResult.role));
      } else {
        console.log('⚠️ Role detection had issues:', roleResult.error);
        console.log('👤 Fallback role:', roleResult.role);
      }
    } catch (error) {
      console.error('❌ Role detection failed:', error);
    }
  }

  async testRoleAccess(): Promise<void> {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      console.error('❌ No authenticated user found for access testing');
      return;
    }

    console.log('🧪 Testing role-based access control...');
    
    const roleResult = await this.roleService.getUserRole(currentUser.uid);
    const userRole = roleResult.role;

    const customerAccess = this.roleService.hasRoleAccess(userRole, 'customer');
    console.log('🏃‍♂️ Customer access:', customerAccess ? '✅ Allowed' : '❌ Denied');

    const ownerAccess = this.roleService.hasRoleAccess(userRole, 'owner');
    console.log('🏢 Owner access:', ownerAccess ? '✅ Allowed' : '❌ Denied');
  }

  async testUserProfileRole(): Promise<void> {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      console.error('❌ No authenticated user found for profile testing');
      return;
    }

    console.log('🧪 Testing user profile role storage...');
    
    try {
      const userDoc = await this.firestore.getFirestore()
        .collection('users')
        .doc(currentUser.uid)
        .get();

      if (userDoc.exists) {
        const userData = userDoc.data();
        console.log('✅ User profile found');
        console.log('👤 Profile role:', userData?.role || 'No role stored');
        console.log('📅 Role updated at:', userData?.roleUpdatedAt || 'Not tracked');
      } else {
        console.log('⚠️ User profile not found in users collection');
      }
    } catch (error) {
      console.error('❌ Error checking user profile:', error);
    }
  }

  async testRoleCollections(): Promise<void> {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      console.error('❌ No authenticated user found for collection testing');
      return;
    }

    console.log('🧪 Testing role-specific collections...');
    
    try {
      const customerDoc = await this.firestore.getFirestore()
        .collection('customerProfiles')
        .doc(currentUser.uid)
        .get();
      
      console.log('🏃‍♂️ Customer profile:', customerDoc.exists ? '✅ Found' : '❌ Not found');
      
      const ownerDoc = await this.firestore.getFirestore()
        .collection('ownerProfiles')
        .doc(currentUser.uid)
        .get();
      
      console.log('🏢 Owner profile:', ownerDoc.exists ? '✅ Found' : '❌ Not found');
      
    } catch (error) {
      console.error('❌ Error checking role collections:', error);
    }
  }

  async runAllTests(): Promise<void> {
    console.log('🚀 Starting role-based navigation tests...');
    console.log('═══════════════════════════════════════');
    
    await this.testCurrentUserRole();
    console.log('───────────────────────────────────────');
    
    await this.testRoleAccess();
    console.log('───────────────────────────────────────');
    
    await this.testUserProfileRole();
    console.log('───────────────────────────────────────');
    
    await this.testRoleCollections();
    console.log('═══════════════════════════════════════');
    console.log('✅ Role navigation tests completed!');
  }
}

export const testRoleNavigation = async (): Promise<void> => {
  const tester = new RoleNavigationTest();
  await tester.runAllTests();
};
