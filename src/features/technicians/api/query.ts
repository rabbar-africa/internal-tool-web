import { useQuery, useMutation, type QueryConfigType } from "@/lib/react-query";
import {
  createTechnician,
  deleteTechnician,
  getTechnicianById,
  getTechnicians,
  updateTechnician,
} from "./service";
import type {
  CreateTechnicianPayload,
  IGetTechnicianFilter,
  UpdateTechnicianPayload,
} from "@/shared/interface/technician";
import { customQueryKey } from "@/shared/constants/query-keys";

export const useGetTechniciansQuery = (
  filter?: IGetTechnicianFilter,
  config?: QueryConfigType<typeof getTechnicians>,
) =>
  useQuery({
    queryKey: [customQueryKey.technicians.getAll, filter],
    queryFn: () => getTechnicians(filter),
    ...config,
  });

export const useGetTechnicianByIdQuery = (id: string) =>
  useQuery({
    queryKey: [customQueryKey.technicians.getById, id],
    queryFn: () => getTechnicianById(id),
    enabled: Boolean(id),
  });

export const useCreateTechnicianMutation = () =>
  useMutation({
    mutationFn: (payload: CreateTechnicianPayload) => createTechnician(payload),
    meta: {
      successMessage: "Technician added successfully",
      invalidatesQueryKeys: [[customQueryKey.technicians.getAll]],
    },
  });

export const useUpdateTechnicianMutation = () =>
  useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateTechnicianPayload;
    }) => updateTechnician(id, payload),
    meta: {
      successMessage: "Technician updated successfully",
      invalidatesQueryKeys: [
        [customQueryKey.technicians.getAll],
        [customQueryKey.technicians.getById],
      ],
    },
  });

export const useDeleteTechnicianMutation = () =>
  useMutation({
    mutationFn: (id: string) => deleteTechnician(id),
    meta: {
      successMessage: "Technician removed",
      invalidatesQueryKeys: [[customQueryKey.technicians.getAll]],
    },
  });
