
import React from 'react';
import HotelUsers from './HotelUsers';
import { useHotelStaff } from '../../../application/hooks/useHotelStaff';

/**
 * Consolidating Role management into the unified HotelUsers component 
 * as per the "Tabbed Layout" requirement. This file now acts as a 
 * convenient wrapper or can be removed if App.tsx is updated.
 */
const HotelRoles: React.FC = () => {
  useHotelStaff();
  return <HotelUsers initialTab="ROLES" />;
};

export default HotelRoles;
