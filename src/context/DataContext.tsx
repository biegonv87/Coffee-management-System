import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Farmer, Harvest, CoffeeGroup, Satellite, AuditLog } from '../types/index.ts';
import { storage } from '../lib/storage.ts';
import { useAuth } from './AuthContext.tsx';

interface DataContextType {
  farmers: Farmer[];
  harvests: Harvest[];
  groups: CoffeeGroup[];
  satellites: Satellite[];
  auditLogs: AuditLog[];
  isOffline: boolean;
  pendingSyncCount: number;
  isSyncing: boolean;
  toggleOfflineMode: () => void;
  syncNow: () => Promise<{ syncedCount: number; errors: string[] }>;
  recordHarvest: (data: {
    farmer: Farmer;
    collectionDate: string;
    cherryHeavy: number;
    cherryLight: number;
    mbuni: number;
    collectionPoint: string;
    remarks?: string;
  }) => Promise<Harvest>;
  correctHarvestRecord: (harvestId: string, updates: Partial<Harvest>, reason: string) => Promise<Harvest>;
  registerFarmer: (farmerData: Omit<Farmer, 'created_at'>) => Promise<Farmer>;
  updateFarmer: (farmerId: string, updates: Partial<Farmer>) => Promise<Farmer>;
  addGroup: (groupName: string, description?: string) => Promise<CoffeeGroup>;
  addSatellite: (satelliteName: string, location?: string) => Promise<Satellite>;
  refreshData: () => Promise<void>;
  resetAllData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [groups, setGroups] = useState<CoffeeGroup[]>([]);
  const [satellites, setSatellites] = useState<Satellite[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isOffline, setIsOffline] = useState<boolean>(storage.isOfflineMode());
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    const data = await storage.initialize();
    setFarmers(data.farmers);
    setHarvests(data.harvests);
    setGroups(data.groups);
    setSatellites(data.satellites);
    setAuditLogs(data.auditLogs);
    setPendingSyncCount(storage.getPendingSyncCount());
  }, []);

  useEffect(() => {
    loadData();

    // Listen to network status
    const handleOnline = () => {
      setIsOffline(storage.isOfflineMode());
    };
    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [loadData]);

  const toggleOfflineMode = () => {
    const nextState = !isOffline;
    storage.setOfflineMode(nextState);
    setIsOffline(nextState);
  };

  const syncNow = async () => {
    setIsSyncing(true);
    try {
      const res = await storage.syncOfflineQueue();
      await loadData();
      return res;
    } finally {
      setIsSyncing(false);
    }
  };

  const recordHarvest = async (data: {
    farmer: Farmer;
    collectionDate: string;
    cherryHeavy: number;
    cherryLight: number;
    mbuni: number;
    collectionPoint: string;
    remarks?: string;
  }): Promise<Harvest> => {
    const ch = Number(data.cherryHeavy) || 0;
    const cl = Number(data.cherryLight) || 0;
    const mb = Number(data.mbuni) || 0;
    const total = Number((ch + cl + mb).toFixed(2));

    const receiptNumber = storage.generateReceiptNumber();
    const harvestId = `HV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const newHarvest: Harvest = {
      harvest_id: harvestId,
      receipt_number: receiptNumber,
      farmer_id: data.farmer.farmer_id,
      farmer_name: data.farmer.farmer_name,
      group: data.farmer.group,
      satellite: data.collectionPoint || data.farmer.satellite,
      collection_date: data.collectionDate,
      cherry_heavy: ch,
      cherry_light: cl,
      mbuni: mb,
      total_kg: total,
      collection_point: data.collectionPoint,
      recorded_by: currentUser.name,
      remarks: data.remarks || '',
      created_at: new Date().toISOString(),
    };

    const { harvest } = await storage.addHarvest(newHarvest);
    await loadData();
    return harvest;
  };

  const correctHarvestRecord = async (
    harvestId: string,
    updates: Partial<Harvest>,
    reason: string
  ): Promise<Harvest> => {
    const res = await storage.correctHarvest(harvestId, updates, currentUser, reason);
    await loadData();
    return res.updated;
  };

  const registerFarmer = async (farmerData: Omit<Farmer, 'created_at'>): Promise<Farmer> => {
    const newFarmer: Farmer = {
      ...farmerData,
      created_at: new Date().toISOString(),
    };
    const res = await storage.addFarmer(newFarmer);
    await loadData();
    return res;
  };

  const updateFarmer = async (farmerId: string, updates: Partial<Farmer>): Promise<Farmer> => {
    const res = await storage.updateFarmer(farmerId, updates);
    await loadData();
    return res;
  };

  const addGroup = async (groupName: string, description?: string): Promise<CoffeeGroup> => {
    const newGroup: CoffeeGroup = {
      group_id: `GRP-${Date.now().toString().slice(-4)}`,
      group_name: groupName.trim(),
      description: description?.trim() || '',
    };
    const res = await storage.addGroup(newGroup);
    await loadData();
    return res;
  };

  const addSatellite = async (satelliteName: string, location?: string): Promise<Satellite> => {
    const newSatellite: Satellite = {
      satellite_id: `SAT-${Date.now().toString().slice(-4)}`,
      satellite_name: satelliteName.trim(),
      location: location?.trim() || '',
    };
    const res = await storage.addSatellite(newSatellite);
    await loadData();
    return res;
  };

  const resetAllData = () => {
    storage.resetToDefaults();
    loadData();
  };

  return (
    <DataContext.Provider
      value={{
        farmers,
        harvests,
        groups,
        satellites,
        auditLogs,
        isOffline,
        pendingSyncCount,
        isSyncing,
        toggleOfflineMode,
        syncNow,
        recordHarvest,
        correctHarvestRecord,
        registerFarmer,
        updateFarmer,
        addGroup,
        addSatellite,
        refreshData: loadData,
        resetAllData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
