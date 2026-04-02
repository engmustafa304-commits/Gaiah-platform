import { useState } from 'react';
import WhatsAppService from '../services/whatsappService';

const whatsappService = new WhatsAppService();

export const useWhatsApp = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendInvitation = async (guest, event) => {
    setLoading(true);
    setError(null);
    try {
      const result = await whatsappService.sendInvitation(
        guest.phone,
        guest.name,
        event.name,
        guest.invitationLink,
        event.date,
        event.location
      );
      return result;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const sendBulkInvitations = async (guests, event) => {
    setLoading(true);
    setError(null);
    try {
      const result = await whatsappService.bulkSend(guests, event);
      return result;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const sendReminder = async (guest, event) => {
    setLoading(true);
    setError(null);
    try {
      const result = await whatsappService.sendReminder(
        guest.phone,
        guest.name,
        event.name,
        event.date,
        event.location
      );
      return result;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const getWhatsAppLink = (phone, message) => {
    return WhatsAppService.getWhatsAppLink(phone, message);
  };

  return {
    sendInvitation,
    sendBulkInvitations,
    sendReminder,
    getWhatsAppLink,
    loading,
    error
  };
};
