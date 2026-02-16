import type { IHotelStaffRepository } from '@/domain/contracts/IHotelStaffRepository';
import type { HotelStaffMember, HotelRole } from '@/domain/entities/HotelStaff';
import { mockStaff, rolesData } from '@/data/hotelUsers';

export class MockHotelStaffRepository implements IHotelStaffRepository {
  async getAllStaff(_hotelId: string): Promise<HotelStaffMember[]> {
    return mockStaff;
  }

  async getAllRoles(_hotelId: string): Promise<HotelRole[]> {
    return rolesData;
  }

  async getStaffById(id: string, _hotelId: string): Promise<HotelStaffMember | null> {
    return mockStaff.find((s) => s.id === id) ?? null;
  }

  async createStaff(data: Omit<HotelStaffMember, 'id'>, _hotelId: string): Promise<HotelStaffMember> {
    return { id: `S-${Date.now()}`, ...data };
  }

  async updateStaff(id: string, data: Partial<HotelStaffMember>, _hotelId: string): Promise<HotelStaffMember> {
    const existing = mockStaff.find((s) => s.id === id);
    return { ...(existing ?? mockStaff[0]), ...data } as HotelStaffMember;
  }

  async deleteStaff(_id: string, _hotelId: string): Promise<void> {
    /* no-op in mock */
  }
}
