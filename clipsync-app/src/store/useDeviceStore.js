import create from 'zustand';
import axios from 'axios';

const useDeviceStore = create((set) => ({

    devices: [],
    isLoading: false,

    /**
     * Register a new device
     */
    registerDevice: async (userId, deviceName, deviceType) => {
        set({ isLoading: true });
        try {
            const response = await axios.post('/api/devices/register', { userId, deviceName, deviceType });
            set((state) => ({ devices: [...state.devices, response.data.device] }));
            return response.data;
        } catch (error) {
            console.error('Error registering device: ', error.response.data.error || error.message);
            throw error;
        } finally {
            set({ isLoading: false });
        }
    }
}));

export default useDeviceStore;