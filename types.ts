/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CatalogItem {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
  image: string;
  professional: 'Isabel Santos' | 'Samara';
}

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  procedureId: string;
  procedureName: string;
  price: number;
  status: 'pending' | 'completed' | 'cancelled';
  notes?: string;
  professionalName?: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  birthDate?: string; // YYYY-MM-DD
  notes?: string;
  totalVisits: number;
  totalSpent: number;
  createdAt: string;
}

export interface FinanceEntry {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  description: string;
  isRawMaterial?: boolean;
  isRecurring?: boolean;
  recurringFrequency?: 'weekly' | 'monthly' | 'yearly';
  qty?: number;
  unitPrice?: number;
}

export interface ReminderLog {
  id: string;
  appointmentId: string;
  clientName: string;
  phone: string;
  messageText: string;
  status: 'sent' | 'pending';
  sentAt?: string;
}
