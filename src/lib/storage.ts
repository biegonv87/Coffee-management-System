import { collection, doc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase.ts';
import { Farmer, Harvest, User, CoffeeGroup, Satellite, AuditLog } from '../types/index.ts';

// Keys for local persistence
const STORAGE_KEYS = {
  FARMERS: 'kahawa_farmers_v1',
  HARVESTS: 'kahawa_harvests_v1',
  OFFLINE_QUEUE: 'kahawa_offline_queue_v1',
  GROUPS: 'kahawa_groups_v1',
  SATELLITES: 'kahawa_satellites_v1',
  USERS: 'kahawa_users_v1',
  AUDIT_LOGS: 'kahawa_audit_logs_v1',
  OFFLINE_MODE: 'kahawa_simulated_offline',
  CURRENT_USER: 'kahawa_current_user',
  NEXT_RECEIPT_SEQ: 'kahawa_receipt_seq_v1',
};

// Initial Seed Data
const DEFAULT_GROUPS: CoffeeGroup[] = [
  { group_id: 'GRP-01', group_name: 'Highlands Farmers Cooperative', description: 'Central zone smallholder farmers' },
  { group_id: 'GRP-02', group_name: 'Mount Kenya Specialty Coffee Group', description: 'High altitude volcanic soil arabica growers' },
  { group_id: 'GRP-03', group_name: 'Rift Valley Arabica Association', description: 'Western slopes premium cherry producers' },
  { group_id: 'GRP-04', group_name: 'Kericho Central Coffee Union', description: 'Highland estate and smallholder collective' },
];

const DEFAULT_SATELLITES: Satellite[] = [
  { satellite_id: 'SAT-01', satellite_name: 'Ainabkoi Buying Centre', location: 'Ainabkoi Town' },
  { satellite_id: 'SAT-02', satellite_name: 'Kipkabus Station', location: 'Kipkabus Junction' },
  { satellite_id: 'SAT-03', satellite_name: 'Timboroa Satellite Centre', location: 'Timboroa High Ground' },
  { satellite_id: 'SAT-04', satellite_name: 'Kapsoit Weighing Depot', location: 'Kapsoit Market' },
];

const DEFAULT_USERS: User[] = [
  {
    user_id: 'USR-01',
    name: 'James Mwangi',
    username: 'admin',
    password: 'password123',
    role: 'Administrator',
    status: 'Active',
    assigned_satellite: 'Ainabkoi Buying Centre',
    phone: '+254 711 000 111',
  },
  {
    user_id: 'USR-02',
    name: 'Faith Chepkemoi',
    username: 'officer',
    password: 'password123',
    role: 'Collection Officer',
    status: 'Active',
    assigned_satellite: 'Ainabkoi Buying Centre',
    phone: '+254 722 000 222',
  },
  {
    user_id: 'USR-03',
    name: 'David Koech',
    username: 'manager',
    password: 'password123',
    role: 'Manager',
    status: 'Active',
    assigned_satellite: 'Ainabkoi Buying Centre',
    phone: '+254 733 000 333',
  },
];

const DEFAULT_FARMERS: Farmer[] = [
  {
    farmer_id: 'K001',
    farmer_name: 'John Kiprotich',
    phone: '+254 712 345 678',
    group: 'Highlands Farmers Cooperative',
    satellite: 'Ainabkoi Buying Centre',
    farm_member_number: 'FM-101',
    status: 'Active',
    created_at: '2026-09-01T08:00:00Z',
  },
  {
    farmer_id: 'K002',
    farmer_name: 'Mary Chebet',
    phone: '+254 723 456 789',
    group: 'Highlands Farmers Cooperative',
    satellite: 'Ainabkoi Buying Centre',
    farm_member_number: 'FM-102',
    status: 'Active',
    created_at: '2026-09-02T08:30:00Z',
  },
  {
    farmer_id: 'K003',
    farmer_name: 'Peter Rono',
    phone: '+254 734 567 890',
    group: 'Mount Kenya Specialty Coffee Group',
    satellite: 'Kipkabus Station',
    farm_member_number: 'FM-201',
    status: 'Active',
    created_at: '2026-09-05T09:15:00Z',
  },
  {
    farmer_id: 'K004',
    farmer_name: 'Beatrice Wanjiku',
    phone: '+254 745 678 901',
    group: 'Mount Kenya Specialty Coffee Group',
    satellite: 'Kipkabus Station',
    farm_member_number: 'FM-202',
    status: 'Active',
    created_at: '2026-09-10T11:00:00Z',
  },
  {
    farmer_id: 'K005',
    farmer_name: 'Emmanuel Kipkorir',
    phone: '+254 756 789 012',
    group: 'Rift Valley Arabica Association',
    satellite: 'Timboroa Satellite Centre',
    farm_member_number: 'FM-301',
    status: 'Active',
    created_at: '2026-09-12T10:00:00Z',
  },
  {
    farmer_id: 'K006',
    farmer_name: 'Hellen Cherono',
    phone: '+254 767 890 123',
    group: 'Kericho Central Coffee Union',
    satellite: 'Kapsoit Weighing Depot',
    farm_member_number: 'FM-401',
    status: 'Active',
    created_at: '2026-09-15T14:20:00Z',
  },
  {
    farmer_id: 'K007',
    farmer_name: 'Samuel Kimani',
    phone: '+254 778 901 234',
    group: 'Highlands Farmers Cooperative',
    satellite: 'Ainabkoi Buying Centre',
    farm_member_number: 'FM-105',
    status: 'Active',
    created_at: '2026-09-18T07:45:00Z',
  },
  {
    farmer_id: 'K008',
    farmer_name: 'Grace Jepkosgei',
    phone: '+254 789 012 345',
    group: 'Rift Valley Arabica Association',
    satellite: 'Timboroa Satellite Centre',
    farm_member_number: 'FM-309',
    status: 'Inactive',
    created_at: '2026-09-20T12:00:00Z',
  },
];

// Initial realistic harvests reflecting the prompt examples
const DEFAULT_HARVESTS: Harvest[] = [
  // Farmer K001 deliveries in October 2026 (Sums to 140 kg total: 30, 45, 25, 40)
  {
    harvest_id: 'HV-2026-001',
    receipt_number: 'CH-2026-000101',
    farmer_id: 'K001',
    farmer_name: 'John Kiprotich',
    group: 'Highlands Farmers Cooperative',
    satellite: 'Ainabkoi Buying Centre',
    collection_date: '2026-10-02',
    cherry_heavy: 25.0,
    cherry_light: 3.5,
    mbuni: 1.5,
    total_kg: 30.0,
    collection_point: 'Ainabkoi Buying Centre',
    recorded_by: 'Faith Chepkemoi',
    remarks: 'First pick of early season cherries',
    created_at: '2026-10-02T09:14:00Z',
    is_synced: true,
  },
  {
    harvest_id: 'HV-2026-002',
    receipt_number: 'CH-2026-000105',
    farmer_id: 'K001',
    farmer_name: 'John Kiprotich',
    group: 'Highlands Farmers Cooperative',
    satellite: 'Ainabkoi Buying Centre',
    collection_date: '2026-10-09',
    cherry_heavy: 38.0,
    cherry_light: 4.5,
    mbuni: 2.5,
    total_kg: 45.0,
    collection_point: 'Ainabkoi Buying Centre',
    recorded_by: 'Faith Chepkemoi',
    remarks: 'Clean ripe red cherries',
    created_at: '2026-10-09T10:30:00Z',
    is_synced: true,
  },
  {
    harvest_id: 'HV-2026-003',
    receipt_number: 'CH-2026-000112',
    farmer_id: 'K001',
    farmer_name: 'John Kiprotich',
    group: 'Highlands Farmers Cooperative',
    satellite: 'Ainabkoi Buying Centre',
    collection_date: '2026-10-16',
    cherry_heavy: 21.0,
    cherry_light: 2.5,
    mbuni: 1.5,
    total_kg: 25.0,
    collection_point: 'Ainabkoi Buying Centre',
    recorded_by: 'Faith Chepkemoi',
    remarks: 'Morning delivery',
    created_at: '2026-10-16T08:45:00Z',
    is_synced: true,
  },
  {
    harvest_id: 'HV-2026-004',
    receipt_number: 'CH-2026-000118',
    farmer_id: 'K001',
    farmer_name: 'John Kiprotich',
    group: 'Highlands Farmers Cooperative',
    satellite: 'Ainabkoi Buying Centre',
    collection_date: '2026-10-24',
    cherry_heavy: 33.5,
    cherry_light: 4.5,
    mbuni: 2.0,
    total_kg: 40.0,
    collection_point: 'Ainabkoi Buying Centre',
    recorded_by: 'Faith Chepkemoi',
    remarks: 'High density cherry',
    created_at: '2026-10-24T11:20:00Z',
    is_synced: true,
  },

  // Farmer K002 deliveries (Mary Chebet: 80 heavy, 10 light, 3 mbuni = 93 kg total)
  {
    harvest_id: 'HV-2026-005',
    receipt_number: 'CH-2026-000102',
    farmer_id: 'K002',
    farmer_name: 'Mary Chebet',
    group: 'Highlands Farmers Cooperative',
    satellite: 'Ainabkoi Buying Centre',
    collection_date: '2026-10-02',
    cherry_heavy: 40.0,
    cherry_light: 5.0,
    mbuni: 1.5,
    total_kg: 46.5,
    collection_point: 'Ainabkoi Buying Centre',
    recorded_by: 'Faith Chepkemoi',
    remarks: 'Grade 1 quality',
    created_at: '2026-10-02T10:15:00Z',
    is_synced: true,
  },
  {
    harvest_id: 'HV-2026-006',
    receipt_number: 'CH-2026-000108',
    farmer_id: 'K002',
    farmer_name: 'Mary Chebet',
    group: 'Highlands Farmers Cooperative',
    satellite: 'Ainabkoi Buying Centre',
    collection_date: '2026-10-14',
    cherry_heavy: 40.0,
    cherry_light: 5.0,
    mbuni: 1.5,
    total_kg: 46.5,
    collection_point: 'Ainabkoi Buying Centre',
    recorded_by: 'Faith Chepkemoi',
    remarks: 'Uniform cherry maturity',
    created_at: '2026-10-14T09:00:00Z',
    is_synced: true,
  },

  // Farmer K003 (Peter Rono: 150 heavy, 20 light, 7 mbuni = 177 kg total)
  {
    harvest_id: 'HV-2026-007',
    receipt_number: 'CH-2026-000104',
    farmer_id: 'K003',
    farmer_name: 'Peter Rono',
    group: 'Mount Kenya Specialty Coffee Group',
    satellite: 'Kipkabus Station',
    collection_date: '2026-10-04',
    cherry_heavy: 75.0,
    cherry_light: 10.0,
    mbuni: 3.5,
    total_kg: 88.5,
    collection_point: 'Kipkabus Station',
    recorded_by: 'David Koech',
    remarks: 'Large lot delivered via tractor',
    created_at: '2026-10-04T14:30:00Z',
    is_synced: true,
  },
  {
    harvest_id: 'HV-2026-008',
    receipt_number: 'CH-2026-000115',
    farmer_id: 'K003',
    farmer_name: 'Peter Rono',
    group: 'Mount Kenya Specialty Coffee Group',
    satellite: 'Kipkabus Station',
    collection_date: '2026-10-18',
    cherry_heavy: 75.0,
    cherry_light: 10.0,
    mbuni: 3.5,
    total_kg: 88.5,
    collection_point: 'Kipkabus Station',
    recorded_by: 'David Koech',
    remarks: 'Premium lot',
    created_at: '2026-10-18T13:40:00Z',
    is_synced: true,
  },

  // Today harvest record (2026-10-05) for testing today's stats!
  {
    harvest_id: 'HV-2026-009',
    receipt_number: 'CH-2026-000125',
    farmer_id: 'K007',
    farmer_name: 'Samuel Kimani',
    group: 'Highlands Farmers Cooperative',
    satellite: 'Ainabkoi Buying Centre',
    collection_date: '2026-10-05',
    cherry_heavy: 50.0,
    cherry_light: 5.0,
    mbuni: 2.0,
    total_kg: 57.0,
    collection_point: 'Ainabkoi Buying Centre',
    recorded_by: 'Faith Chepkemoi',
    remarks: 'Fresh morning harvest delivery',
    created_at: '2026-10-05T07:20:00Z',
    is_synced: true,
  },
  {
    harvest_id: 'HV-2026-010',
    receipt_number: 'CH-2026-000126',
    farmer_id: 'K004',
    farmer_name: 'Beatrice Wanjiku',
    group: 'Mount Kenya Specialty Coffee Group',
    satellite: 'Kipkabus Station',
    collection_date: '2026-10-05',
    cherry_heavy: 32.5,
    cherry_light: 4.0,
    mbuni: 1.5,
    total_kg: 38.0,
    collection_point: 'Kipkabus Station',
    recorded_by: 'David Koech',
    remarks: 'Good density cherries',
    created_at: '2026-10-05T08:10:00Z',
    is_synced: true,
  }
];

class StorageService {
  // Read local storage safely
  private getLocal<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.warn(`Error reading key ${key} from localStorage:`, e);
      return defaultValue;
    }
  }

  // Write local storage safely
  private setLocal<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(`Error writing key ${key} to localStorage:`, e);
    }
  }

  // Offline network mode state
  public isOfflineMode(): boolean {
    const manualOffline = this.getLocal<boolean>(STORAGE_KEYS.OFFLINE_MODE, false);
    return manualOffline || !navigator.onLine;
  }

  public setOfflineMode(value: boolean): void {
    this.setLocal(STORAGE_KEYS.OFFLINE_MODE, value);
  }

  // Receipt Number Generator: e.g. CH-2026-000127
  public generateReceiptNumber(): string {
    const currentYear = new Date().getFullYear();
    let seq = this.getLocal<number>(STORAGE_KEYS.NEXT_RECEIPT_SEQ, 127);
    seq += 1;
    this.setLocal(STORAGE_KEYS.NEXT_RECEIPT_SEQ, seq);
    const padded = String(seq).padStart(6, '0');
    return `CH-${currentYear}-${padded}`;
  }

  // Initialize and Seed Data if empty
  public async initialize(): Promise<{
    farmers: Farmer[];
    harvests: Harvest[];
    groups: CoffeeGroup[];
    satellites: Satellite[];
    users: User[];
    auditLogs: AuditLog[];
  }> {
    let farmers = this.getLocal<Farmer[]>(STORAGE_KEYS.FARMERS, []);
    let harvests = this.getLocal<Harvest[]>(STORAGE_KEYS.HARVESTS, []);
    let groups = this.getLocal<CoffeeGroup[]>(STORAGE_KEYS.GROUPS, []);
    let satellites = this.getLocal<Satellite[]>(STORAGE_KEYS.SATELLITES, []);
    let users = this.getLocal<User[]>(STORAGE_KEYS.USERS, []);
    let auditLogs = this.getLocal<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, []);

    // First time seed
    if (groups.length === 0) {
      groups = DEFAULT_GROUPS;
      this.setLocal(STORAGE_KEYS.GROUPS, groups);
    }
    if (satellites.length === 0) {
      satellites = DEFAULT_SATELLITES;
      this.setLocal(STORAGE_KEYS.SATELLITES, satellites);
    }
    if (users.length === 0) {
      users = DEFAULT_USERS;
      this.setLocal(STORAGE_KEYS.USERS, users);
    }
    if (farmers.length === 0) {
      farmers = DEFAULT_FARMERS;
      this.setLocal(STORAGE_KEYS.FARMERS, farmers);
    }
    if (harvests.length === 0) {
      harvests = DEFAULT_HARVESTS;
      this.setLocal(STORAGE_KEYS.HARVESTS, harvests);
    }

    // Attempt background sync with Firestore if online
    if (!this.isOfflineMode()) {
      try {
        await this.syncWithCloud(farmers, harvests, groups, satellites, users);
      } catch (err) {
        console.warn('Initial cloud sync notice (using local cache):', err);
      }
    }

    return { farmers, harvests, groups, satellites, users, auditLogs };
  }

  // Push seed data or pull cloud changes
  private async syncWithCloud(
    farmers: Farmer[],
    harvests: Harvest[],
    groups: CoffeeGroup[],
    satellites: Satellite[],
    users: User[]
  ): Promise<void> {
    try {
      // 1. Fetch remote farmers
      const farmersSnapshot = await getDocs(collection(db, 'farmers'));
      if (farmersSnapshot.empty) {
        // Upload initial farmers
        for (const f of farmers) {
          await setDoc(doc(db, 'farmers', f.farmer_id), f);
        }
      }

      // 2. Fetch remote harvests
      const harvestsSnapshot = await getDocs(collection(db, 'harvests'));
      if (harvestsSnapshot.empty) {
        // Upload initial harvests
        for (const h of harvests) {
          await setDoc(doc(db, 'harvests', h.harvest_id), h);
        }
      }

      // 3. Sync groups
      const groupsSnapshot = await getDocs(collection(db, 'groups'));
      if (groupsSnapshot.empty) {
        for (const g of groups) {
          await setDoc(doc(db, 'groups', g.group_id), g);
        }
      }

      // 4. Sync satellites
      const satSnapshot = await getDocs(collection(db, 'satellites'));
      if (satSnapshot.empty) {
        for (const s of satellites) {
          await setDoc(doc(db, 'satellites', s.satellite_id), s);
        }
      }

      // 5. Sync users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      if (usersSnapshot.empty) {
        for (const u of users) {
          await setDoc(doc(db, 'users', u.user_id), u);
        }
      }
    } catch (error) {
      console.warn('Sync with cloud background notice:', error);
    }
  }

  // Harvest Creation with Offline Queue & Cloud Sync
  public async addHarvest(harvest: Harvest): Promise<{ harvest: Harvest; synced: boolean }> {
    const harvests = this.getLocal<Harvest[]>(STORAGE_KEYS.HARVESTS, []);
    
    // Check duplicate
    const exists = harvests.some(
      h => h.harvest_id === harvest.harvest_id || h.receipt_number === harvest.receipt_number
    );
    if (exists) {
      throw new Error(`Record with Receipt #${harvest.receipt_number} already exists.`);
    }

    const isOffline = this.isOfflineMode();
    const newHarvest: Harvest = {
      ...harvest,
      is_synced: !isOffline,
    };

    // Save locally
    harvests.unshift(newHarvest);
    this.setLocal(STORAGE_KEYS.HARVESTS, harvests);

    let synced = false;
    if (isOffline) {
      // Add to offline queue
      const queue = this.getLocal<Harvest[]>(STORAGE_KEYS.OFFLINE_QUEUE, []);
      queue.push(newHarvest);
      this.setLocal(STORAGE_KEYS.OFFLINE_QUEUE, queue);
    } else {
      try {
        await setDoc(doc(db, 'harvests', newHarvest.harvest_id), newHarvest);
        synced = true;
      } catch (err) {
        console.warn('Failed to upload directly to Firestore, queuing offline:', err);
        const queue = this.getLocal<Harvest[]>(STORAGE_KEYS.OFFLINE_QUEUE, []);
        queue.push(newHarvest);
        this.setLocal(STORAGE_KEYS.OFFLINE_QUEUE, queue);
      }
    }

    return { harvest: newHarvest, synced };
  }

  // Synchronize offline queue to Firestore
  public async syncOfflineQueue(): Promise<{ syncedCount: number; errors: string[] }> {
    const queue = this.getLocal<Harvest[]>(STORAGE_KEYS.OFFLINE_QUEUE, []);
    if (queue.length === 0) {
      return { syncedCount: 0, errors: [] };
    }

    let syncedCount = 0;
    const errors: string[] = [];
    const remainingQueue: Harvest[] = [];
    const harvests = this.getLocal<Harvest[]>(STORAGE_KEYS.HARVESTS, []);

    for (const item of queue) {
      try {
        await setDoc(doc(db, 'harvests', item.harvest_id), {
          ...item,
          is_synced: true,
        });
        syncedCount++;

        // Update local item flag
        const idx = harvests.findIndex(h => h.harvest_id === item.harvest_id);
        if (idx !== -1) {
          harvests[idx].is_synced = true;
        }
      } catch (err: any) {
        remainingQueue.push(item);
        errors.push(`Receipt ${item.receipt_number}: ${err.message || 'Sync failed'}`);
      }
    }

    this.setLocal(STORAGE_KEYS.OFFLINE_QUEUE, remainingQueue);
    this.setLocal(STORAGE_KEYS.HARVESTS, harvests);

    return { syncedCount, errors };
  }

  public getPendingSyncCount(): number {
    const queue = this.getLocal<Harvest[]>(STORAGE_KEYS.OFFLINE_QUEUE, []);
    return queue.length;
  }

  // Update Harvest Record (Admin correction) with Audit Trail
  public async correctHarvest(
    harvestId: string,
    updates: Partial<Harvest>,
    user: User,
    reason: string
  ): Promise<{ updated: Harvest; audit: AuditLog }> {
    if (user.role !== 'Administrator') {
      throw new Error('Unauthorized: Only Administrators can correct harvest records.');
    }
    if (!reason || reason.trim().length < 5) {
      throw new Error('A detailed reason for correction is required (at least 5 characters).');
    }

    const harvests = this.getLocal<Harvest[]>(STORAGE_KEYS.HARVESTS, []);
    const index = harvests.findIndex(h => h.harvest_id === harvestId);
    if (index === -1) {
      throw new Error('Harvest record not found.');
    }

    const oldHarvest = { ...harvests[index] };
    const now = new Date().toISOString();

    // Recalculate total_kg if subcategories are modified
    const ch = updates.cherry_heavy !== undefined ? Number(updates.cherry_heavy) : oldHarvest.cherry_heavy;
    const cl = updates.cherry_light !== undefined ? Number(updates.cherry_light) : oldHarvest.cherry_light;
    const mb = updates.mbuni !== undefined ? Number(updates.mbuni) : oldHarvest.mbuni;
    const calculatedTotal = Number((ch + cl + mb).toFixed(2));

    const updatedHarvest: Harvest = {
      ...oldHarvest,
      ...updates,
      cherry_heavy: ch,
      cherry_light: cl,
      mbuni: mb,
      total_kg: calculatedTotal,
      updated_at: now,
    };

    harvests[index] = updatedHarvest;
    this.setLocal(STORAGE_KEYS.HARVESTS, harvests);

    // Create Audit Log
    const audit: AuditLog = {
      audit_id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      user_id: user.user_id,
      user_name: user.name,
      harvest_id: harvestId,
      action: 'CORRECTION',
      old_value: JSON.stringify({
        heavy: oldHarvest.cherry_heavy,
        light: oldHarvest.cherry_light,
        mbuni: oldHarvest.mbuni,
        total: oldHarvest.total_kg,
        date: oldHarvest.collection_date,
      }),
      new_value: JSON.stringify({
        heavy: updatedHarvest.cherry_heavy,
        light: updatedHarvest.cherry_light,
        mbuni: updatedHarvest.mbuni,
        total: updatedHarvest.total_kg,
        date: updatedHarvest.collection_date,
      }),
      reason: reason.trim(),
      timestamp: now,
    };

    const auditLogs = this.getLocal<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, []);
    auditLogs.unshift(audit);
    this.setLocal(STORAGE_KEYS.AUDIT_LOGS, auditLogs);

    // Sync to Firestore if online
    if (!this.isOfflineMode()) {
      try {
        await updateDoc(doc(db, 'harvests', harvestId), {
          ...updatedHarvest,
        });
        await setDoc(doc(db, 'audit_logs', audit.audit_id), audit);
      } catch (err) {
        console.warn('Cloud sync update failed (persisted locally):', err);
      }
    }

    return { updated: updatedHarvest, audit };
  }

  // Register New Farmer
  public async addFarmer(farmer: Farmer): Promise<Farmer> {
    const farmers = this.getLocal<Farmer[]>(STORAGE_KEYS.FARMERS, []);
    
    // Check if ID already exists
    if (farmers.some(f => f.farmer_id.toLowerCase() === farmer.farmer_id.toLowerCase())) {
      throw new Error(`Farmer ID ${farmer.farmer_id} already exists. Please choose a unique ID.`);
    }

    farmers.unshift(farmer);
    this.setLocal(STORAGE_KEYS.FARMERS, farmers);

    if (!this.isOfflineMode()) {
      try {
        await setDoc(doc(db, 'farmers', farmer.farmer_id), farmer);
      } catch (err) {
        console.warn('Could not sync new farmer to cloud immediately:', err);
      }
    }

    return farmer;
  }

  // Update Farmer
  public async updateFarmer(farmerId: string, updates: Partial<Farmer>): Promise<Farmer> {
    const farmers = this.getLocal<Farmer[]>(STORAGE_KEYS.FARMERS, []);
    const idx = farmers.findIndex(f => f.farmer_id === farmerId);
    if (idx === -1) throw new Error('Farmer not found');

    const updated = { ...farmers[idx], ...updates, updated_at: new Date().toISOString() };
    farmers[idx] = updated;
    this.setLocal(STORAGE_KEYS.FARMERS, farmers);

    if (!this.isOfflineMode()) {
      try {
        await updateDoc(doc(db, 'farmers', farmerId), updated);
      } catch (err) {
        console.warn('Could not update farmer in cloud immediately:', err);
      }
    }

    return updated;
  }

  // Add / Update Coffee Group
  public async addGroup(group: CoffeeGroup): Promise<CoffeeGroup> {
    const groups = this.getLocal<CoffeeGroup[]>(STORAGE_KEYS.GROUPS, []);
    if (groups.some(g => g.group_name.toLowerCase() === group.group_name.toLowerCase())) {
      throw new Error(`Group '${group.group_name}' already exists.`);
    }
    groups.push(group);
    this.setLocal(STORAGE_KEYS.GROUPS, groups);
    if (!this.isOfflineMode()) {
      try {
        await setDoc(doc(db, 'groups', group.group_id), group);
      } catch (e) {
        console.warn('Group cloud sync error:', e);
      }
    }
    return group;
  }

  // Add / Update Satellite
  public async addSatellite(satellite: Satellite): Promise<Satellite> {
    const sats = this.getLocal<Satellite[]>(STORAGE_KEYS.SATELLITES, []);
    if (sats.some(s => s.satellite_name.toLowerCase() === satellite.satellite_name.toLowerCase())) {
      throw new Error(`Satellite centre '${satellite.satellite_name}' already exists.`);
    }
    sats.push(satellite);
    this.setLocal(STORAGE_KEYS.SATELLITES, sats);
    if (!this.isOfflineMode()) {
      try {
        await setDoc(doc(db, 'satellites', satellite.satellite_id), satellite);
      } catch (e) {
        console.warn('Satellite cloud sync error:', e);
      }
    }
    return satellite;
  }

  // Add User
  public async addUser(user: User): Promise<User> {
    const users = this.getLocal<User[]>(STORAGE_KEYS.USERS, []);
    if (users.some(u => u.username.toLowerCase() === user.username.toLowerCase())) {
      throw new Error(`Username '${user.username}' is already taken.`);
    }
    users.push(user);
    this.setLocal(STORAGE_KEYS.USERS, users);
    if (!this.isOfflineMode()) {
      try {
        await setDoc(doc(db, 'users', user.user_id), user);
      } catch (e) {
        console.warn('User cloud sync error:', e);
      }
    }
    return user;
  }

  // Update User
  public async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const users = this.getLocal<User[]>(STORAGE_KEYS.USERS, []);
    const idx = users.findIndex(u => u.user_id === userId);
    if (idx === -1) throw new Error('User not found');
    const updated = { ...users[idx], ...updates };
    users[idx] = updated;
    this.setLocal(STORAGE_KEYS.USERS, users);
    if (!this.isOfflineMode()) {
      try {
        await updateDoc(doc(db, 'users', userId), updated);
      } catch (e) {
        console.warn('User update cloud sync error:', e);
      }
    }
    return updated;
  }

  // Reset demo data to defaults
  public resetToDefaults(): void {
    this.setLocal(STORAGE_KEYS.FARMERS, DEFAULT_FARMERS);
    this.setLocal(STORAGE_KEYS.HARVESTS, DEFAULT_HARVESTS);
    this.setLocal(STORAGE_KEYS.GROUPS, DEFAULT_GROUPS);
    this.setLocal(STORAGE_KEYS.SATELLITES, DEFAULT_SATELLITES);
    this.setLocal(STORAGE_KEYS.USERS, DEFAULT_USERS);
    this.setLocal(STORAGE_KEYS.AUDIT_LOGS, []);
    this.setLocal(STORAGE_KEYS.OFFLINE_QUEUE, []);
    this.setLocal(STORAGE_KEYS.NEXT_RECEIPT_SEQ, 130);
  }
}

export const storage = new StorageService();
