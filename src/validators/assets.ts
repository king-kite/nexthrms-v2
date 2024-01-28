import { InferType, date, number, object, string } from 'yup';

export const createAssetSchema = object({
  assetId: string().required().label('Asset ID'),
  condition: string().oneOf(['BAD', 'GOOD', 'EXCELLENT']).required().label('Condition'),
  description: string().nullable().optional().label('Description'),
  model: string().nullable().optional().label('Model'),
  manufacturer: string().required().label('Manufacturer'),
  name: string().required().label('Name'),
  purchaseDate: date().required().label('Purchase Date'),
  purchaseFrom: string().required().label('Purchase From'),
  serialNo: string().required().label('Serial Number'),
  status: string().oneOf(['APPROVED', 'DENIED', 'PENDING', 'RETURNED']).required().label('Status'),
  supplier: string().required().label('Supplier'),
  warranty: number().required().label('Warranty'),
  value: number().required().label('Value'),
  userId: string().required().label('User ID'),
});

export type AssetCreateType = InferType<typeof createAssetSchema>;
