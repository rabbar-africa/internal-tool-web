import { useQuery } from "@/lib/react-query";

const BASE = "https://vpic.nhtsa.dot.gov/api/vehicles";

interface NhtsaMake {
  MakeId: number;
  MakeName: string;
}

interface NhtsaModel {
  Make_ID: number;
  Make_Name: string;
  Model_ID: number;
  Model_Name: string;
}

const fetchMakes = async (): Promise<NhtsaMake[]> => {
  const res = await fetch(`${BASE}/GetMakesForVehicleType/car?format=json`);
  const json = await res.json();
  return (json.Results as NhtsaMake[]) ?? [];
};

const fetchModelsByMake = async (make: string): Promise<NhtsaModel[]> => {
  const res = await fetch(
    `${BASE}/GetModelsForMake/${encodeURIComponent(make)}?format=json`,
  );
  const json = await res.json();
  return (json.Results as NhtsaModel[]) ?? [];
};

export const useVehicleMakesQuery = () =>
  useQuery({
    queryKey: ["nhtsa-makes"],
    queryFn: fetchMakes,
    staleTime: 24 * 60 * 60 * 1000, // 24 h — makes rarely change
    gcTime: 24 * 60 * 60 * 1000,
    select: (data) =>
      data
        .map((m) => ({ label: m.MakeName, value: m.MakeName }))
        .sort((a, b) => a.label.localeCompare(b.label)),
  });

export const useVehicleModelsQuery = (make: string) =>
  useQuery({
    queryKey: ["nhtsa-models", make],
    queryFn: () => fetchModelsByMake(make),
    enabled: Boolean(make),
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    select: (data) =>
      data
        .map((m) => ({ label: m.Model_Name, value: m.Model_Name }))
        .sort((a, b) => a.label.localeCompare(b.label)),
  });

export const getYearOptions = () => {
  const current = new Date().getFullYear();
  return Array.from({ length: current - 1969 }, (_, i) => {
    const y = String(current - i);
    return { label: y, value: y };
  });
};
