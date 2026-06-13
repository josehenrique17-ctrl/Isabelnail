/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Calendar, 
  Users, 
  DollarSign, 
  Clock, 
  Phone, 
  Mail, 
  Plus, 
  Check, 
  X, 
  MessageSquare, 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  Scissors, 
  ChevronRight, 
  CheckCircle,
  AlertCircle,
  Copy,
  ExternalLink,
  Shield,
  UserCheck,
  CalendarCheck,
  HelpCircle,
  ArrowRight,
  Info,
  Instagram,
  Layers,
  Repeat,
  Package,
  Database
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Cell,
  Legend,
  PieChart,
  Pie
} from 'recharts';
import { CatalogItem, Appointment, Client, FinanceEntry, ReminderLog } from './types.ts';
import NailCourse from './components/NailCourse.tsx';

const sqlScript = `-- ----------------------------------------------------
-- SCRIPT DE MIGRACAO SQL PARA O SUPABASE
-- Execute este script no SQL Editor do seu painel Supabase
-- ----------------------------------------------------

-- 1. Tabela de Catalogo de Procedimentos
CREATE TABLE IF NOT EXISTS catalog (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "price" NUMERIC NOT NULL,
  "duration" INTEGER NOT NULL,
  "image" TEXT,
  "professional" TEXT NOT NULL
);

-- 2. Tabela de Clientes (CRM)
CREATE TABLE IF NOT EXISTS clients (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "phone" TEXT NOT NULL UNIQUE,
  "email" TEXT,
  "birthDate" TEXT,
  "notes" TEXT,
  "totalVisits" INTEGER DEFAULT 0,
  "totalSpent" NUMERIC DEFAULT 0,
  "createdAt" TEXT NOT NULL
);

-- 3. Tabela de Agendamentos
CREATE TABLE IF NOT EXISTS appointments (
  "id" TEXT PRIMARY KEY,
  "clientId" TEXT REFERENCES clients("id") ON DELETE SET NULL,
  "clientName" TEXT NOT NULL,
  "clientPhone" TEXT NOT NULL,
  "date" TEXT NOT NULL,
  "time" TEXT NOT NULL,
  "procedureId" TEXT REFERENCES catalog("id") ON DELETE SET NULL,
  "procedureName" TEXT NOT NULL,
  "price" NUMERIC NOT NULL,
  "status" TEXT NOT NULL,
  "notes" TEXT,
  "professionalName" TEXT
);

-- 4. Tabela de Lancamentos Financeiros
CREATE TABLE IF NOT EXISTS finance (
  "id" TEXT PRIMARY KEY,
  "type" TEXT NOT NULL,
  "amount" NUMERIC NOT NULL,
  "category" TEXT NOT NULL,
  "date" TEXT NOT NULL,
  "description" TEXT,
  "isRawMaterial" BOOLEAN DEFAULT FALSE,
  "isRecurring" BOOLEAN DEFAULT FALSE,
  "recurringFrequency" TEXT,
  "qty" INTEGER,
  "unitPrice" NUMERIC
);

-- 5. Tabela de Lembretes Enviados
CREATE TABLE IF NOT EXISTS reminders (
  "id" TEXT PRIMARY KEY,
  "appointmentId" TEXT,
  "clientName" TEXT,
  "phone" TEXT,
  "messageText" TEXT,
  "status" TEXT,
  "sentAt" TEXT
);`;

export default function App() {
  // Navigation: 'client' | 'course' | 'admin'
  const [viewMode, setViewMode] = useState<'client' | 'course' | 'admin'>('client');
  // Admin Sub-Tab: 'appointments' | 'crm' | 'finance' | 'reminders' | 'supabase'
  const [adminTab, setAdminTab] = useState<'appointments' | 'crm' | 'finance' | 'reminders' | 'supabase'>('appointments');

  // Supabase Database Connection Status State
  const [dbStatus, setDbStatus] = useState<{
    status: 'local' | 'supabase_active' | 'supabase_error';
    supabaseConfigured: boolean;
    tablesCreated?: boolean;
    message: string;
    catalogCount?: number;
  } | null>(null);

  const [seedingLoading, setSeedingLoading] = useState(false);
  const [seedingSuccess, setSeedingSuccess] = useState<string | null>(null);
  const [seedingError, setSeedingError] = useState<string | null>(null);
  const [copiarSqlNotificacao, setCopiarSqlNotificacao] = useState(false);

  const handleSeedSupabase = async () => {
    setSeedingLoading(true);
    setSeedingSuccess(null);
    setSeedingError(null);
    try {
      const res = await fetch('/api/db-seed', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setSeedingSuccess(data.message || "Dados semeados com sucesso!");
        loadData(); // Recarrega todas as listas
      } else {
        setSeedingError(data.error || "Falha ao semear tabelas.");
      }
    } catch (e: any) {
      setSeedingError("Falha de conexão com o servidor: " + (e.message || e));
    } finally {
      setSeedingLoading(false);
    }
  };

  const fetchDbStatus = async () => {
    try {
      const res = await fetch('/api/db-status');
      if (res.ok) {
        setDbStatus(await res.json());
      }
    } catch (e) {
      console.error("Error fetching db status:", e);
    }
  };

  // Admin Authentication States
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('isabel_santos_admin_auth') === 'true';
  });
  const [adminPassword, setAdminPassword] = useState<string>(() => {
    return localStorage.getItem('isabel_santos_admin_password') || 'isabel123';
  });
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Password Recovery States
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryEmailInput, setRecoveryEmailInput] = useState('');
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [recoverySuccess, setRecoverySuccess] = useState<string | null>(null);
  
  // Password Reset States
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmNewPasswordInput, setConfirmNewPasswordInput] = useState('');
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameInput.trim() === 'admin' && passwordInput === adminPassword) {
      setIsAdminAuthenticated(true);
      sessionStorage.setItem('isabel_santos_admin_auth', 'true');
      setLoginError(null);
      setUsernameInput('');
      setPasswordInput('');
    } else {
      setLoginError('Usuário ou senha incorretos. Tente novamente.');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem('isabel_santos_admin_auth');
    setViewMode('client');
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmailInput.trim()) {
      setLoginError('Por favor, digite seu e-mail ou telefone cadastrado.');
      return;
    }
    
    // Simulate link generation
    const token = 'tok_' + Math.random().toString(36).substr(2, 9);
    const simLink = `${window.location.origin}/admin/reset-password?token=${token}`;
    
    setGeneratedLink(simLink);
    setRecoverySuccess('Um link de recuperação de senha foi disparado!');
    setLoginError(null);
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPasswordInput.length < 4) {
      setResetError('A senha deve ter pelo menos 4 caracteres.');
      return;
    }
    if (newPasswordInput !== confirmNewPasswordInput) {
      setResetError('As senhas digitadas não coincidem.');
      return;
    }

    // Save password
    localStorage.setItem('isabel_santos_admin_password', newPasswordInput);
    setAdminPassword(newPasswordInput);
    setResetSuccess('Sua nova senha foi atualizada com sucesso!');
    setResetError(null);
    setNewPasswordInput('');
    setConfirmNewPasswordInput('');
    
    // Auto return to login after 2.5 seconds
    setTimeout(() => {
      setIsResettingPassword(false);
      setResetSuccess(null);
      setIsRecovering(false);
      setGeneratedLink(null);
      setRecoverySuccess(null);
      setRecoveryEmailInput('');
    }, 2500);
  };

  // Application States
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [finance, setFinance] = useState<FinanceEntry[]>([]);
  const [reminders, setReminders] = useState<ReminderLog[]>([]);

  // Loading States
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Loaded Client Profile
  const [clientProfile, setClientProfile] = useState<{ id?: string, name: string; phone: string; email: string; birthDate: string } | null>(() => {
    const saved = localStorage.getItem('isabel_santos_client_profile');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // Client Booking Form States
  const [bookingStep, setBookingStep] = useState(1); // 1: Select proc, 2: Select Date/Time, 3: Fill details, 4: Success
  const [selectedProc, setSelectedProc] = useState<CatalogItem | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [clientName, setClientName] = useState(clientProfile?.name || '');
  const [clientPhone, setClientPhone] = useState(clientProfile?.phone || '');
  const [clientEmail, setClientEmail] = useState(clientProfile?.email || '');
  const [clientBirthDate, setClientBirthDate] = useState(clientProfile?.birthDate || '');
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookedReceipt, setBookedReceipt] = useState<Appointment | null>(null);

  // Registration form inputs
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regBirthDate, setRegBirthDate] = useState('');

  useEffect(() => {
    if (clientProfile) {
      setClientName(clientProfile.name);
      setClientPhone(clientProfile.phone);
      setClientEmail(clientProfile.email);
      setClientBirthDate(clientProfile.birthDate);
    }
  }, [clientProfile]);

  // Admin Actions Form States
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientBirthDate, setNewClientBirthDate] = useState('');
  const [newClientNotes, setNewClientNotes] = useState('');

  const [showAddFinanceModal, setShowAddFinanceModal] = useState(false);
  const [finType, setFinType] = useState<'income' | 'expense'>('expense');
  const [finAmount, setFinAmount] = useState('');
  const [finCategory, setFinCategory] = useState('Suprimentos');
  const [finDate, setFinDate] = useState(new Date().toISOString().split('T')[0]);
  const [finDescription, setFinDescription] = useState('');

  // Finance Sub-Tab Selector
  const [financeSubTab, setFinanceSubTab] = useState<'overview' | 'raw-materials' | 'recurring'>('overview');

  // Raw Materials input states
  const [rawMaterialName, setRawMaterialName] = useState('');
  const [rawMaterialPrice, setRawMaterialPrice] = useState('');
  const [rawMaterialQty, setRawMaterialQty] = useState('');
  const [rawMaterialCategory, setRawMaterialCategory] = useState('Suprimentos');
  const [rawMaterialRentability, setRawMaterialRentability] = useState('15');
  const [rawMaterialDate, setRawMaterialDate] = useState(new Date().toISOString().split('T')[0]);

  // Recurring Expenses input and templates states
  const [recurringName, setRecurringName] = useState('');
  const [recurringAmount, setRecurringAmount] = useState('');
  const [recurringInterval, setRecurringInterval] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [recurringDueDate, setRecurringDueDate] = useState('10');
  const [recurringCategory, setRecurringCategory] = useState('Aluguel Sala');

  const [recurringTemplates, setRecurringTemplates] = useState<{
    id: string;
    name: string;
    amount: number;
    interval: 'weekly' | 'monthly' | 'yearly';
    dueDate: number;
    category: string;
  }[]>(() => {
    const saved = localStorage.getItem('isabel_recurrent_templates');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    const defaults = [
      { id: 'rec_1', name: 'Aluguel do Estúdio', amount: 1200, interval: 'monthly', dueDate: 10, category: 'Aluguel Sala' },
      { id: 'rec_2', name: 'Energia Elétrica', amount: 180, interval: 'monthly', dueDate: 15, category: 'Luz/Água' },
      { id: 'rec_3', name: 'Taxa Software CRM', amount: 50, interval: 'monthly', dueDate: 5, category: 'Assinatura' },
      { id: 'rec_4', name: 'Tráfego Pago & Marketing', amount: 200, interval: 'monthly', dueDate: 20, category: 'Marketing' }
    ];
    localStorage.setItem('isabel_recurrent_templates', JSON.stringify(defaults));
    return defaults as any;
  });

  // Watch templates and keep localStorage updated
  useEffect(() => {
    localStorage.setItem('isabel_recurrent_templates', JSON.stringify(recurringTemplates));
  }, [recurringTemplates]);

  // AI Reminder Draft States
  const [selectedAptForReminder, setSelectedAptForReminder] = useState<Appointment | null>(null);
  const [generatedReminderText, setGeneratedReminderText] = useState('');
  const [generatingReminder, setGeneratingReminder] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Search/Filter states in Admin
  const [crmSearch, setCrmSearch] = useState('');
  const [aptDateFilter, setAptDateFilter] = useState(''); // Empty means all
  const [selectedClientDetail, setSelectedClientDetail] = useState<Client | null>(null);

  // Available Time Slots for agendamento
  const timeSlots = ["09:00", "10:30", "13:00", "14:30", "16:00", "17:30"];

  // Load all app data from Backend
  const loadData = async () => {
    setLoading(true);
    fetchDbStatus();
    try {
      const [resCat, resApt, resCli, resFin, resRem] = await Promise.all([
        fetch('/api/catalog'),
        fetch('/api/appointments'),
        fetch('/api/clients'),
        fetch('/api/finance'),
        fetch('/api/reminders')
      ]);

      if (resCat.ok && resApt.ok && resCli.ok && resFin.ok && resRem.ok) {
        setCatalog(await resCat.json());
        setAppointments(await resApt.json());
        setClients(await resCli.json());
        setFinance(await resFin.json());
        setReminders(await resRem.json());
      } else {
        setErrorMsg("Erro ao carregar os dados das APIs do servidor.");
      }
    } catch (e) {
      console.error(e);
      setErrorMsg("Conexão interrompida com o servidor de banco de dados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter out booked slots on a selected date for a specific professional
  const getAvailableSlots = (date: string, professionalName?: string) => {
    if (!date) return timeSlots;
    const bookedForDate = appointments
      .filter(apt => 
        apt.date === date && 
        apt.status !== 'cancelled' && 
        (!professionalName || (apt.professionalName || "Isabel Santos") === professionalName)
      )
      .map(apt => apt.time);
    return timeSlots.filter(t => !bookedForDate.includes(t));
  };

  // Submit Client Booking
  const handleClientBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProc || !bookingDate || !bookingTime || !clientName || !clientPhone) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName,
          clientPhone,
          clientEmail,
          clientBirthDate,
          date: bookingDate,
          time: bookingTime,
          procedureId: selectedProc.id,
          notes: bookingNotes
        })
      });

      if (response.ok) {
        const createdApt = await response.json();
        setBookedReceipt(createdApt);
        setBookingStep(4);
        
        // Refresh local data silently
        loadData();
      } else {
        const error = await response.json();
        alert(`Erro: ${error.error || "Não foi possível finalizar o agendamento."}`);
      }
    } catch (err) {
      console.error(err);
      alert("Falha de conexão.");
    }
  };

  // Quick reset booking states
  const resetBookingForm = () => {
    setBookingStep(1);
    setSelectedProc(null);
    setBookingDate('');
    setBookingTime('');
    setClientName(clientProfile?.name || '');
    setClientPhone(clientProfile?.phone || '');
    setBookingNotes('');
    setBookedReceipt(null);
  };

  // Pre-cadastro / login handler
  const handleClientRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regPhone.trim() || !regBirthDate.trim()) {
      alert("Por favor, preencha nome, telefone e data de nascimento.");
      return;
    }

    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName.trim(),
          phone: regPhone.trim(),
          email: regEmail.trim(),
          birthDate: regBirthDate.trim()
        })
      });

      if (response.ok) {
        const clientSaved = await response.json();
        const profile = {
          id: clientSaved.id,
          name: clientSaved.name,
          phone: clientSaved.phone,
          email: clientSaved.email || '',
          birthDate: clientSaved.birthDate || ''
        };
        setClientProfile(profile);
        localStorage.setItem('isabel_santos_client_profile', JSON.stringify(profile));
        
        // Populate inputs
        setClientName(profile.name);
        setClientPhone(profile.phone);
        setClientEmail(profile.email);
        setClientBirthDate(profile.birthDate);
        
        setBookingStep(1);
      } else {
        const err = await response.json();
        alert(`Erro ao fazer pré-cadastro: ${err.error || "Tente novamente."}`);
      }
    } catch (err) {
      console.error(err);
      alert("Conexão interrompida com o servidor.");
    }
  };

  // Sair/Reset pre-cadastro
  const handleLogoutClient = () => {
    if (confirm("Deseja realmente sair e trocar de cliente?")) {
      setClientProfile(null);
      localStorage.removeItem('isabel_santos_client_profile');
      setClientName('');
      setClientPhone('');
      setClientEmail('');
      setClientBirthDate('');
      setRegName('');
      setRegPhone('');
      setRegEmail('');
      setRegBirthDate('');
      resetBookingForm();
    }
  };

  // Create Client from Admin CRM
  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName || !newClientPhone) {
      alert("Nome e Telefone são obrigatórios.");
      return;
    }
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newClientName,
          phone: newClientPhone,
          email: newClientEmail,
          birthDate: newClientBirthDate,
          notes: newClientNotes
        })
      });
      if (response.ok) {
        setShowAddClientModal(false);
        setNewClientName('');
        setNewClientPhone('');
        setNewClientEmail('');
        setNewClientBirthDate('');
        setNewClientNotes('');
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Save updated client notes
  const handleSaveClientNotes = async (clientId: string, noteText: string) => {
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: noteText })
      });
      if (response.ok) {
        loadData();
        // Update model client details too
        const updated = await response.json();
        setSelectedClientDetail(updated);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Change Appointment Status (Admin)
  const handleUpdateStatus = async (id: string, newStatus: 'completed' | 'cancelled') => {
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add Manual Financial Entry (Admin)
  const handleAddFinance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!finAmount || !finCategory || !finDate) {
      alert("Preencha o valor, a categoria e a data.");
      return;
    }
    try {
      const response = await fetch('/api/finance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: finType,
          amount: finAmount,
          category: finCategory,
          date: finDate,
          description: finDescription
        })
      });
      if (response.ok) {
        setShowAddFinanceModal(false);
        setFinAmount('');
        setFinDescription('');
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Finance Entry (Admin)
  const handleDeleteFinance = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta entrada financeira?")) return;
    try {
      const response = await fetch(`/api/finance/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add Raw Material Financial Entry / Inventory Trigger
  const handleAddRawMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawMaterialName || !rawMaterialPrice || !rawMaterialQty) {
      alert("Preencha o nome, o custo e a quantidade da matéria-prima.");
      return;
    }
    const calculatedUnitPrice = Number(rawMaterialPrice) / Number(rawMaterialQty);
    try {
      const response = await fetch('/api/finance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'expense',
          amount: Number(rawMaterialPrice),
          category: rawMaterialCategory || 'Suprimentos',
          date: rawMaterialDate,
          description: `Matéria-prima: ${rawMaterialName} (Qtd: ${rawMaterialQty}u | Rendimento: ${rawMaterialRentability || 15} atendimentos)`,
          isRawMaterial: true,
          qty: Number(rawMaterialQty),
          unitPrice: calculatedUnitPrice
        })
      });
      if (response.ok) {
        setRawMaterialName('');
        setRawMaterialPrice('');
        setRawMaterialQty('');
        setRawMaterialRentability('15');
        loadData();
        alert(`Matéria-prima "${rawMaterialName}" registrada com sucesso!`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add Recurring Template Gasto Recorrente
  const handleAddRecurringTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recurringName || !recurringAmount) {
      alert("Preencha o nome e o valor.");
      return;
    }
    const newTpl = {
      id: 'rec_' + Date.now(),
      name: recurringName,
      amount: Number(recurringAmount),
      interval: recurringInterval,
      dueDate: Number(recurringDueDate),
      category: recurringCategory
    };
    setRecurringTemplates(prev => [...prev, newTpl]);
    setRecurringName('');
    setRecurringAmount('');
    alert(`Modelo de Gasto Recorrente "${recurringName}" adicionado com sucesso!`);
  };

  // Delete Recurring Template
  const handleDeleteRecurringTemplate = (id: string) => {
    if (!confirm("Tem certeza que deseja remover este modelo de gasto recorrente?")) return;
    setRecurringTemplates(prev => prev.filter(t => t.id !== id));
  };

  // Pay/Register a recurring cost for current month
  const handlePayRecurringExpense = async (template: { name: string; amount: number; category: string; dueDate: number }) => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(template.dueDate).padStart(2, '0');
    const computedDate = `${year}-${month}-${day}`;
    
    if (!confirm(`Confirmar pagamento de R$ ${template.amount.toFixed(2)} para "${template.name}"?`)) return;

    try {
      const response = await fetch('/api/finance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'expense',
          amount: template.amount,
          category: template.category,
          date: computedDate,
          description: `Gasto Recorrente: ${template.name}`,
          isRecurring: true
        })
      });
      if (response.ok) {
        loadData();
        alert(`Gasto "${template.name}" lançado com sucesso para o dia do vencimento ${day}/${month}/${year}!`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // AIS-Powered Reminder Draft Service (Gemini AI inside)
  const handleGenerateAIReminder = async (apt: Appointment) => {
    setSelectedAptForReminder(apt);
    setGeneratingReminder(true);
    setGeneratedReminderText('');
    try {
      const response = await fetch('/api/generate-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: apt.clientName,
          procedureName: apt.procedureName,
          date: apt.date,
          time: apt.time,
          businessName: "Isabel Santos Nail Designer",
          professionalName: apt.professionalName
        })
      });
      if (response.ok) {
        const data = await response.json();
        setGeneratedReminderText(data.message);
      } else {
        setGeneratedReminderText("Erro ao gerar o lembrete. Verifique o servidor.");
      }
    } catch (err) {
      console.error(err);
      setGeneratedReminderText("Erro na comunicação. Lembrete gerado offline.");
    } finally {
      setGeneratingReminder(false);
    }
  };

  // Simulate logging a reminder sent and opening WhatsApp
  const handleConfirmSendReminder = async () => {
    if (!selectedAptForReminder || !generatedReminderText) return;

    try {
      // 1. Log sent status in backend database
      await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: selectedAptForReminder.id,
          clientName: selectedAptForReminder.clientName,
          phone: selectedAptForReminder.clientPhone,
          messageText: generatedReminderText
        })
      });
      
      // 2. Open actual WhatsApp API (Universal URL) in a new tab to send 
      const cleanPhone = selectedAptForReminder.clientPhone.replace(/\D/g, '');
      const encodedMsg = encodeURIComponent(generatedReminderText);
      const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMsg}`;
      window.open(whatsappUrl, '_blank');
      
      // 3. Clear states and reload
      setSelectedAptForReminder(null);
      setGeneratedReminderText('');
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Copy simulated reminder text to clipboard
  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  // Calculate Financial statistics
  const getFinanceStats = () => {
    const incomes = finance.filter(f => f.type === 'income').reduce((sum, f) => sum + f.amount, 0);
    const expenses = finance.filter(f => f.type === 'expense').reduce((sum, f) => sum + f.amount, 0);
    const profit = incomes - expenses;
    const completedAptsCount = appointments.filter(a => a.status === 'completed').length;
    const avgTicket = completedAptsCount > 0 ? (incomes / completedAptsCount) : 0;
    
    return { incomes, expenses, profit, avgTicket };
  };

  // Recharts: Generate chart data by month
  const getChartDataByMonth = () => {
    const monthsNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const monthlyMap: { [key: string]: { monthName: string, Faturamento: number, Custos: number } } = {};

    // Put current and last few months in order
    const orderedMonthsCodes = ["2026-03", "2026-04", "2026-05", "2026-06"];
    orderedMonthsCodes.forEach(code => {
      const monthIdx = parseInt(code.split('-')[1]) - 1;
      monthlyMap[code] = {
        monthName: monthsNames[monthIdx],
        Faturamento: 0,
        Custos: 0
      };
    });

    finance.forEach(entry => {
      const yearMonth = entry.date.substring(0, 7); // e.g., "2026-06"
      if (monthlyMap[yearMonth]) {
        if (entry.type === 'income') {
          monthlyMap[yearMonth].Faturamento += entry.amount;
        } else {
          monthlyMap[yearMonth].Custos += entry.amount;
        }
      }
    });

    return orderedMonthsCodes.map(code => ({
      name: monthlyMap[code].monthName,
      Faturamento: Number(monthlyMap[code].Faturamento.toFixed(2)),
      Custos: Number(monthlyMap[code].Custos.toFixed(2)),
    }));
  };

  // Aggregated expense distribution by category for the Pie Chart
  const getExpensePieData = () => {
    const expensesOnly = finance.filter(f => f.type === 'expense');
    const categoryTotals: { [key: string]: number } = {};
    
    expensesOnly.forEach(entry => {
      const cat = entry.category ? entry.category.trim() : 'Outros';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + entry.amount;
    });
    
    const data = Object.keys(categoryTotals).map(cat => ({
      name: cat,
      value: Number(categoryTotals[cat].toFixed(2))
    }));
    
    return data.sort((a, b) => b.value - a.value);
  };

  // Get active birthdays celebrating today
  const getTodayBirthdays = () => {
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayMMDD = `${mm}-${dd}`;
    
    return clients.filter(client => {
      if (!client.birthDate) return false;
      return client.birthDate.endsWith(todayMMDD);
    });
  };

  const PIE_COLORS = [
    '#db2777', // Rose 600
    '#f43f5e', // Rose 500
    '#e11d48', // Rose 600 dark
    '#fb7185', // Rose 400
    '#fda4af', // Rose 300
    '#ef4444', // Red 500
    '#f59e0b', // Amber 500
    '#06b6d4', // Cyan 500
    '#8b5cf6', // Purple 500
    '#6b7280', // Gray 500
  ];

  const financeStats = getFinanceStats();
  const crmFilteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(crmSearch.toLowerCase()) || 
    c.phone.includes(crmSearch)
  );

  return (
    <div className="min-h-screen bg-[#FCFAF8] text-neutral-800 font-sans flex flex-col antialiased">
      
      {/* Dynamic Upper Navigation / Brand Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-rose-100 shadow-xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo Brand / Human, literal labels */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setViewMode('client')}>
            <div className="bg-rose-100 text-rose-700 w-11 h-11 rounded-full flex items-center justify-center font-serif text-lg font-bold tracking-wide shadow-xs border border-rose-200">
              IS
            </div>
            <div>
              <h1 className="font-serif tracking-widest text-[#2E1E1C] text-xl font-bold uppercase">
                ISABEL SANTOS
              </h1>
              <p className="text-[10px] tracking-widest text-neutral-500 uppercase font-medium">
                Nail Designer Premium
              </p>
            </div>
          </div>

          {/* Instagram link for mobile/desktop */}
          <div className="hidden lg:flex items-center space-x-2 text-rose-700 hover:text-rose-900 transition-all font-medium text-xs bg-rose-50/50 hover:bg-rose-50 px-3.5 py-1.5 rounded-full border border-rose-100/70">
            <Instagram className="w-3.5 h-3.5" />
            <a 
              href="https://www.instagram.com/isabelsantos.naildesigner/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:underline tracking-tight"
            >
              @isabelsantos.naildesigner
            </a>
          </div>

          {/* Quick Swapper (Portal do Cliente / Curso / Painel Isabel) */}
          <div className="flex items-center bg-rose-50/70 p-1.5 rounded-full border border-rose-100/80">
            <button
              id="btn_client_view"
              onClick={() => { setViewMode('client'); resetBookingForm(); }}
              className={`px-5 py-2 text-xs font-semibold uppercase tracking-wider rounded-full transition-all cursor-pointer ${
                viewMode === 'client'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-900/70 hover:text-rose-900'
              }`}
            >
              💅 Área da Cliente
            </button>
            <button
              id="btn_course_view"
              onClick={() => setViewMode('course')}
              className={`px-5 py-2 text-xs font-semibold uppercase tracking-wider rounded-full transition-all cursor-pointer flex items-center space-x-1 ${
                viewMode === 'course'
                  ? 'bg-rose-500 text-white shadow-xs bg-[#db2777]'
                  : 'text-rose-900/70 hover:text-rose-900'
              }`}
            >
              🎓 Curso Nails Academy
            </button>
            <button
              id="btn_admin_view"
              onClick={() => { setViewMode('admin'); loadData(); }}
              className={`px-5 py-2 text-xs font-semibold uppercase tracking-wider rounded-full transition-all cursor-pointer flex items-center space-x-1.5 ${
                viewMode === 'admin'
                  ? 'bg-neutral-800 text-white shadow-xs'
                  : 'text-neutral-700/70 hover:text-neutral-900'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>💼 Painel da Isabel</span>
            </button>
          </div>

        </div>
      </header>

      {/* Primary Container */}
      <main className="flex-1">
        {loading && (
          <div className="max-w-7xl mx-auto px-4 py-20 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin"></div>
            <p className="text-neutral-500 font-medium text-sm">Carregando portal Isabel Santos...</p>
          </div>
        )}

        {errorMsg && (
          <div className="max-w-4xl mx-auto my-10 p-5 bg-red-50 text-red-800 rounded-2xl border border-red-100 flex items-start space-x-3.5 shadow-sm">
            <AlertCircle className="w-6 h-6 text-red-600 shrink-0" />
            <div>
              <h3 className="font-bold text-sm">Aviso de Banco de Dados</h3>
              <p className="text-xs text-red-700/90 mt-1">{errorMsg}</p>
              <button 
                onClick={loadData}
                className="mt-3 px-4 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700"
              >
                Tentar Recarregar
              </button>
            </div>
          </div>
        )}

        {!loading && !errorMsg && (
          <>
            {/* ========================================================= */}
            {/*                  CLIENT FACING EXPERIENCE                 */}
            {/* ========================================================= */}
            {viewMode === 'client' && (
              <div className="pb-24">
                
                {/* Brand Hero & Experience Section */}
                <section className="relative px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-rose-50/60 via-transparent to-transparent pt-12 pb-8">
                  <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    
                    <div className="space-y-6">
                      <div className="inline-flex items-center space-x-2 bg-rose-150 text-rose-800 px-3.5 py-1 rounded-full text-xs font-semibold tracking-wider uppercase">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Autenticidade & Detalhes</span>
                      </div>
                      
                      <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#2F1F1D] leading-tight tracking-tight">
                        A beleza de estar em <br />
                        <span className="text-rose-600 italic">melhores mãos.</span>
                      </h2>
                      
                      <p className="text-neutral-600 text-normal leading-relaxed max-w-xl">
                        Nail designer especializada em acabamento natural, alongamentos delicados de alta durabilidade, blindagem protetora e cutilagem técnica russa. Agende seu atendimento online em poucos passos e viva um momento único.
                      </p>

                      <div className="pt-2 flex items-center space-x-4">
                        <a 
                          href="#scroll_catalogo"
                          className="px-8 py-3.5 bg-[#2E1E1C] text-white text-xs uppercase font-bold tracking-widest hover:bg-rose-950 transition-all rounded-xs flex items-center space-x-2 shadow-sm"
                        >
                          <span>Ver Catálogo</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </a>
                        <button 
                          onClick={() => {
                            const element = document.getElementById('agendar_ancora');
                            element?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="px-8 py-3.5 bg-rose-600 text-white text-xs uppercase font-bold tracking-widest hover:bg-rose-700 transition-all rounded-xs shadow-sm shadow-rose-200"
                        >
                          Agendar Horário
                        </button>
                      </div>
                    </div>

                    {/* Splendid banner image */}
                    <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-16/10 group">
                      <img 
                        src="https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1200&auto=format&fit=crop" 
                        alt="Luxurious Salon Interior"
                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-end p-6">
                        <div className="text-white">
                          <p className="text-[10px] tracking-widest uppercase font-semibold text-rose-200">Nosso Espaço</p>
                          <h4 className="font-serif text-lg font-bold">Isabel Santos | Nail designer</h4>
                        </div>
                      </div>
                    </div>

                  </div>
                </section>

                {/* BIRTHDAYS OF THE DAY SECTION */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
                  <div className="bg-gradient-to-r from-rose-50 to-amber-50 rounded-3xl border border-rose-100 p-6 sm:p-8 shadow-3xs relative overflow-hidden flex flex-col md:flex-row items-center gap-6">
                    {/* Festive background elements */}
                    <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-amber-200/20 rounded-full blur-xl pointer-events-none" />
                    <div className="absolute -left-6 -top-6 w-24 h-24 bg-rose-200/20 rounded-full blur-xl pointer-events-none" />

                    <div className="flex-1 space-y-4">
                      <div className="flex items-center space-x-2 text-rose-700">
                        <Sparkles className="w-5 h-5 animate-pulse text-amber-500" />
                        <h3 className="font-serif text-lg sm:text-xl font-extrabold tracking-tight">Aniversariantes do Dia 👑</h3>
                      </div>
                      
                      {getTodayBirthdays().length > 0 ? (
                        <div className="space-y-3">
                          <p className="text-neutral-600 text-xs sm:text-sm">
                            Hoje é um dia especial para nossas clientes queridas! Parabéns e muitas felicidades:
                          </p>
                           <div className="flex flex-wrap gap-3">
                             {getTodayBirthdays().map(client => (
                               <div 
                                 key={client.id}
                                 className="bg-white/95 backdrop-blur-xs border border-rose-100 rounded-2xl px-4 py-2.5 shadow-4xs flex items-center space-x-2.5 animate-in fade-in slide-in-from-bottom-2 duration-300"
                               >
                                 <span className="text-xl">🎈</span>
                                 <div>
                                   <h4 className="font-bold text-xs text-[#2E1E1C]">{client.name}</h4>
                                   <p className="text-[10px] text-rose-600 font-medium font-serif">B-day Celebration 💫</p>
                                 </div>
                               </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1.5 py-1">
                          <p className="text-neutral-600 text-xs sm:text-sm font-medium">
                            Nenhum(a) aniversariante registrado(a) para hoje.
                          </p>
                          <p className="text-neutral-400 text-[11px]">
                            Cadastre seu aniversário para receber presentes exclusivos e condições especiais em seu mês!
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="w-full md:w-auto shrink-0 bg-white/70 backdrop-blur-xs border border-rose-100 rounded-2xl p-4 sm:p-5 text-center sm:text-left">
                      <div className="space-y-2">
                        <div className="flex items-center justify-center sm:justify-start space-x-2">
                          <span className="text-lg">🎁</span>
                          <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">Presente Especial</span>
                        </div>
                        <p className="text-[11px] text-neutral-500 max-w-xs leading-relaxed">
                          Clientes aniversariantes ganham um mimo e esmaltação especial ao realizar qualquer procedimento no dia do aniversário!
                        </p>
                        <div className="pt-1">
                          <button
                            onClick={() => {
                              const element = document.getElementById('agendar_ancora');
                              element?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="w-full sm:w-auto px-4 py-2 bg-[#2D1F1D] text-white hover:bg-neutral-900 font-extrabold uppercase text-[10px] tracking-wider rounded-lg transition-all cursor-pointer shadow-4xs"
                          >
                            Agendar Meu Momento
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* PROCEDURES CATALOG WITH IMAGES */}
                <section id="scroll_catalogo" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-24">
                  <div className="text-center max-w-2xl mx-auto mb-12">
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
                      Menu de Serviços Exclusivos
                    </h3>
                    <div className="w-16 h-0.5 bg-rose-400 mx-auto mt-3"></div>
                    <p className="text-neutral-500 text-xs mt-3">
                      Procedimentos refinados com produtos importados e biossegurança garantida.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {catalog.map((item) => (
                      <div 
                        key={item.id} 
                        id={`catalog_${item.id}`}
                        className="bg-white rounded-xl overflow-hidden border border-rose-100/60 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="relative aspect-4/3 overflow-hidden bg-neutral-100">
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs px-3 py-1 rounded-full border border-rose-100">
                              <span className="font-semibold text-rose-700 text-xs">
                                R$ {item.price.toFixed(2).replace('.', ',')}
                              </span>
                            </div>
                          </div>
                          <div className="p-6">
                            <div className="flex items-center space-x-1.5 mb-2">
                              <span className={`text-[10px] uppercase font-semibold tracking-wider px-2.5 py-0.5 rounded-full ${
                                item.professional === 'Isabel Santos'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-150'
                                  : 'bg-teal-50 text-teal-850 border border-teal-150'
                              }`}>
                                👤 {item.professional}
                              </span>
                            </div>
                            <h4 className="font-serif font-bold text-lg text-neutral-900 mb-2">{item.name}</h4>
                            <p className="text-neutral-500 text-xs leading-relaxed mb-2">{item.description}</p>
                          </div>
                        </div>

                        <div className="px-6 pb-6 pt-0 border-t border-rose-50/50 flex items-center justify-between">
                          <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider flex items-center">
                            <Clock className="w-3.5 h-3.5 text-rose-400 mr-1.5" />
                            {item.duration} minutos
                          </span>

                          <button
                            id={`btn_book_proc_${item.id}`}
                            onClick={() => {
                              setSelectedProc(item);
                              setBookingStep(2);
                              const element = document.getElementById('agendar_ancora');
                              element?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold uppercase rounded-lg transition-all"
                          >
                            Agendar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* SCHEDULING WIDGET (SISTEMA DE AGENDAMENTO INTEGRADO) */}
                <section id="agendar_ancora" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 scroll-mt-24">
                  <div className="bg-white rounded-3xl border border-rose-100/80 shadow-sm p-6 sm:p-10 relative overflow-hidden">
                    
                    {/* Subtle ornamental patterns */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full blur-3xl -z-10"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-neutral-50 rounded-full blur-3xl -z-10"></div>

                    <div className="text-center mb-8">
                      <h3 className="font-serif text-2xl font-bold tracking-tight text-[#2E1E1C]">
                        Agendamento Descomplicado
                      </h3>
                      <p className="text-neutral-400 text-xs mt-1">
                        Reserve sua vaga em tempo real no nosso sistema integrado
                      </p>
                    </div>

                    {clientProfile === null ? (
                      <div className="max-w-md mx-auto space-y-6">
                        <div className="text-center space-y-2">
                          <span className="inline-flex items-center space-x-1.5 bg-rose-50 text-rose-700 font-bold px-3 py-1 rounded-full text-[10px] tracking-wider uppercase">
                            🔒 Acesso da Cliente
                          </span>
                          <h4 className="font-serif text-xl font-bold text-neutral-800">Faça o seu Pré-Cadastro</h4>
                          <p className="text-neutral-400 text-xs leading-relaxed">
                            Insira suas informações abaixo para liberar a agenda completa de horários de Isabel Santos & Samara e agendar seu procedimento.
                          </p>
                        </div>

                        <form onSubmit={handleClientRegistration} className="space-y-4">
                          <div>
                            <label className="block text-neutral-600 text-xs font-bold uppercase tracking-wider mb-1">
                              Nome Completo *
                            </label>
                            <input
                              type="text"
                              required
                              value={regName}
                              onChange={(e) => setRegName(e.target.value)}
                              placeholder="Digite seu nome completo"
                              className="w-full p-3.5 bg-neutral-50 rounded-xl border border-rose-100 text-sm focus:outline-none focus:border-rose-500 focus:bg-white transition-all placeholder:text-neutral-350"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-neutral-600 text-xs font-bold uppercase tracking-wider mb-1">
                                Celular / WhatsApp *
                              </label>
                              <input
                                type="tel"
                                required
                                value={regPhone}
                                onChange={(e) => setRegPhone(e.target.value)}
                                placeholder="Ex: (11) 99999-9999"
                                className="w-full p-3.5 bg-neutral-50 rounded-xl border border-rose-100 text-sm focus:outline-none focus:border-rose-500 focus:bg-white transition-all placeholder:text-neutral-350"
                              />
                            </div>

                            <div>
                              <label className="block text-neutral-600 text-xs font-bold uppercase tracking-wider mb-1">
                                Data de Nascimento *
                              </label>
                              <input
                                type="date"
                                required
                                value={regBirthDate}
                                onChange={(e) => setRegBirthDate(e.target.value)}
                                className="w-full p-3.5 bg-neutral-50 rounded-xl border border-rose-100 text-sm focus:outline-none focus:border-rose-500 focus:bg-white transition-all text-neutral-800"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-neutral-600 text-xs font-bold uppercase tracking-wider mb-1">
                              E-mail *
                            </label>
                            <input
                              type="email"
                              required
                              value={regEmail}
                              onChange={(e) => setRegEmail(e.target.value)}
                              placeholder="Digite seu melhor e-mail"
                              className="w-full p-3.5 bg-neutral-50 rounded-xl border border-rose-100 text-sm focus:outline-none focus:border-rose-500 focus:bg-white transition-all placeholder:text-neutral-350"
                            />
                          </div>

                          <button
                            type="submit"
                            id="btn_submit_registration"
                            className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-xs flex items-center justify-center space-x-2 cursor-pointer"
                          >
                            <span>Efetuar Pré-Cadastro & Ver Agenda</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </form>

                        <div className="pt-2 text-center">
                          <p className="text-[10px] text-neutral-400">
                            🛡️ Seus dados estão sob sigilo absoluto de acordo com nossas políticas de privacidade de Isabel & Samara.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Profile Bar */}
                        <div className="mb-6 p-4 bg-rose-50/30 rounded-2xl border border-rose-100/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 font-bold text-xs uppercase">
                              {clientProfile.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-[10px] text-neutral-450 uppercase font-semibold">Conta Conectada</p>
                              <p className="text-xs font-bold text-[#2E1E1C]">{clientProfile.name} • {clientProfile.phone}</p>
                            </div>
                          </div>
                          
                          <button
                            type="button"
                            onClick={handleLogoutClient}
                            className="text-[11px] font-bold text-rose-650 hover:text-rose-800 uppercase tracking-wider"
                          >
                            Alterar Cliente 🔄
                          </button>
                        </div>

                        {/* STEP INDEX BAR */}
                    <div className="flex items-center justify-center space-x-4 mb-10 max-w-lg mx-auto">
                      <div className="flex items-center">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                          bookingStep >= 1 ? 'bg-rose-600 text-white' : 'bg-neutral-100 text-neutral-400'
                        }`}>1</div>
                        <span className="text-[10px] font-semibold tracking-wider text-neutral-400 uppercase ml-2 hidden sm:inline">Serviço</span>
                      </div>
                      <div className="w-12 h-px bg-rose-100"></div>
                      <div className="flex items-center">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                          bookingStep >= 2 ? 'bg-rose-600 text-white' : 'bg-neutral-100 text-neutral-400'
                        }`}>2</div>
                        <span className="text-[10px] font-semibold tracking-wider text-neutral-400 uppercase ml-2 hidden sm:inline">Data & Hora</span>
                      </div>
                      <div className="w-12 h-px bg-rose-100"></div>
                      <div className="flex items-center">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                          bookingStep >= 3 ? 'bg-rose-600 text-white' : 'bg-neutral-100 text-neutral-400'
                        }`}>3</div>
                        <span className="text-[10px] font-semibold tracking-wider text-neutral-400 uppercase ml-2 hidden sm:inline">Identificação</span>
                      </div>
                    </div>

                    {/* Step Content 1: Procedure Selection */}
                    {bookingStep === 1 && (
                      <div className="space-y-4">
                        <label className="text-neutral-700 text-xs font-bold uppercase tracking-wider block">
                          Selecione o procedimento desejado:
                        </label>
                        <div className="grid grid-cols-1 gap-3">
                          {catalog.map(proc => (
                            <button
                              key={proc.id}
                              id={`select_proc_btn_${proc.id}`}
                              onClick={() => {
                                setSelectedProc(proc);
                                setBookingStep(2);
                              }}
                              className={`w-full p-4 rounded-xl border text-left flex items-center justify-between transition-all hover:bg-rose-50/50 ${
                                selectedProc?.id === proc.id 
                                  ? 'border-rose-600 bg-rose-50/20 shadow-xs' 
                                  : 'border-rose-100 bg-white'
                              }`}
                            >
                              <div className="flex items-center space-x-3.5">
                                <div className="w-12 h-12 rounded-lg bg-rose-50 overflow-hidden shrink-0">
                                  <img src={proc.image} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <h4 className="text-sm font-semibold text-neutral-800">{proc.name}</h4>
                                    <span className={`text-[9px] px-1.5 py-0.5 font-bold rounded uppercase tracking-wider ${
                                      proc.professional === 'Isabel Santos'
                                        ? 'bg-rose-50 text-rose-600 border border-rose-100'
                                        : 'bg-teal-50 text-teal-850 border border-teal-100'
                                    }`}>
                                      {proc.professional}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-neutral-400 mt-0.5">{proc.duration} min • Biossegurança garantida</p>
                                </div>
                              </div>
                              <span className="font-bold text-rose-600 text-sm">
                                R$ {proc.price.toFixed(2).replace('.', ',')}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Step Content 2: Date & Time selector */}
                    {bookingStep === 2 && selectedProc && (
                      <div className="space-y-6">
                        <div className="p-4 bg-rose-50/50 rounded-xl border border-rose-100 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">Serviço Selecionado</span>
                            <h4 className="text-sm font-bold text-[#2E1E1C]">
                              {selectedProc.name} • <span className="font-normal text-xs text-neutral-500">Profissional: {selectedProc.professional}</span>
                            </h4>
                          </div>
                          <button 
                            onClick={() => setBookingStep(1)}
                            className="text-xs text-rose-600 hover:underline font-bold"
                          >
                            Alterar
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          
                          {/* Left: Day Input */}
                          <div className="space-y-2">
                            <label className="text-neutral-700 text-xs font-bold uppercase tracking-wider block">
                              1. Escolha o dia do atendimento:
                            </label>
                            <input
                              type="date"
                              id="input_booking_date"
                              value={bookingDate}
                              min={new Date().toISOString().split('T')[0]} // No past dates
                              onChange={(e) => {
                                setBookingDate(e.target.value);
                                setBookingTime(''); // reset time on day change
                              }}
                              className="w-full p-3.5 bg-neutral-50 rounded-xl border border-rose-100 text-sm focus:outline-none focus:border-rose-500 focus:bg-white"
                            />
                            <p className="text-[10px] text-neutral-400 mt-1 flex items-center">
                              <Info className="w-3.5 h-3.5 text-rose-400 mr-1" /> Atendemos de Terça a Sábado, das 09h às 19h.
                            </p>
                          </div>

                          {/* Right: Available slots picker */}
                          <div className="space-y-2">
                            <label className="text-neutral-700 text-xs font-bold uppercase tracking-wider block">
                              2. Horários Disponíveis:
                            </label>
                            
                            {!bookingDate ? (
                              <div className="h-32 bg-neutral-50 rounded-xl flex items-center justify-center border border-dashed border-rose-100">
                                <span className="text-neutral-400 text-xs">Selecione uma data primeiro</span>
                              </div>
                            ) : getAvailableSlots(bookingDate, selectedProc?.professional).length === 0 ? (
                              <div className="h-32 bg-red-50/50 rounded-xl flex items-center justify-center border border-red-100">
                                <span className="text-red-700 font-semibold text-xs text-center p-4">Todos os horários ocupados para este dia com esta profissional. Escolha outra data.</span>
                              </div>
                            ) : (
                              <div className="grid grid-cols-3 gap-2">
                                {getAvailableSlots(bookingDate, selectedProc?.professional).map(time => (
                                  <button
                                    key={time}
                                    id={`select_time_${time}`}
                                    onClick={() => setBookingTime(time)}
                                    className={`p-3.5 text-xs font-bold rounded-xl border transition-all ${
                                      bookingTime === time 
                                        ? 'bg-rose-600 text-white border-rose-600' 
                                        : 'bg-white text-neutral-700 border-rose-100 hover:border-rose-400'
                                    }`}
                                  >
                                    {time}h
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                        </div>

                        {/* Control buttons */}
                        <div className="pt-4 flex justify-between">
                          <button
                            onClick={() => setBookingStep(1)}
                            className="px-6 py-3 border border-rose-100 text-neutral-600 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-neutral-50 transition-all"
                          >
                            Voltar
                          </button>
                          
                          <button
                            id="btn_booking_step2_next"
                            disabled={!bookingDate || !bookingTime}
                            onClick={() => setBookingStep(3)}
                            className={`px-8 py-3 font-bold text-xs uppercase tracking-wider rounded-xl transition-all ${
                              bookingDate && bookingTime
                                ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm'
                                : 'bg-neutral-100 text-neutral-350 cursor-not-allowed'
                            }`}
                          >
                            Continuar
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step Content 3: Identifying detail forms */}
                    {bookingStep === 3 && selectedProc && (
                      <form onSubmit={handleClientBooking} className="space-y-6">
                        
                        {/* Summary of reservation so far */}
                        <div className="p-4 bg-rose-50/50 rounded-xl border border-rose-100 grid grid-cols-3 gap-4">
                          <div>
                            <span className="text-[10px] uppercase tracking-wider text-rose-700 font-semibold">Procedimento</span>
                            <h5 className="text-xs font-bold text-neutral-800 leading-tight">{selectedProc.name}</h5>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase tracking-wider text-rose-700 font-semibold">Dia Reservado</span>
                            <h5 className="text-xs font-bold text-neutral-800 leading-tight">
                              {bookingDate.split('-').reverse().join('/')}
                            </h5>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase tracking-wider text-rose-700 font-semibold">Horário de Início</span>
                            <h5 className="text-xs font-bold text-neutral-800 leading-tight">{bookingTime}h</h5>
                          </div>
                        </div>

                        <div className="space-y-4">
                          
                          {/* Client Name */}
                          <div>
                            <label className="text-neutral-700 text-xs font-bold uppercase tracking-wider block mb-1.5">
                              Seu Nome Completo: *
                            </label>
                            <input
                              type="text"
                              required
                              id="input_booking_name"
                              placeholder="Fórmula de identificação (Ex: Ana Clara Souza)"
                              value={clientName}
                              onChange={(e) => setClientName(e.target.value)}
                              className="w-full p-3.5 bg-neutral-50 rounded-xl border border-rose-100 text-sm focus:outline-none focus:border-rose-500 focus:bg-white"
                            />
                          </div>

                          {/* Client WhatsApp Number */}
                          <div>
                            <label className="text-neutral-700 text-xs font-bold uppercase tracking-wider block mb-1.5 flex items-center justify-between">
                              <span>WhatsApp / Celular: *</span>
                              <span className="text-[10px] text-rose-500 font-normal">Para o envio de lembrete com Inteligência Artificial</span>
                            </label>
                            <input
                              type="tel"
                              required
                              id="input_booking_phone"
                              placeholder="+55 (11) 99999-9999"
                              value={clientPhone}
                              onChange={(e) => setClientPhone(e.target.value)}
                              className="w-full p-3.5 bg-neutral-50 rounded-xl border border-rose-100 text-sm focus:outline-none focus:border-rose-500 focus:bg-white"
                            />
                          </div>

                          {/* Notes */}
                          <div>
                            <label className="text-neutral-700 text-xs font-bold uppercase tracking-wider block mb-1.5">
                              Instruções adicionais / Observações (opcional):
                            </label>
                            <textarea
                              id="input_booking_notes"
                              placeholder="Possui alguma fragilidade, unhas roídas ou prefere algum formato específico (quadrada, bailarina, almond)?"
                              value={bookingNotes}
                              onChange={(e) => setBookingNotes(e.target.value)}
                              rows={3}
                              className="w-full p-3.5 bg-neutral-50 rounded-xl border border-rose-100 text-sm focus:outline-none focus:border-rose-500 focus:bg-white"
                            />
                          </div>

                        </div>

                        {/* Controls */}
                        <div className="pt-4 flex justify-between">
                          <button
                            type="button"
                            onClick={() => setBookingStep(2)}
                            className="px-6 py-3 border border-rose-100 text-neutral-600 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-neutral-50 transition-all"
                          >
                            Voltar
                          </button>
                          
                          <button
                            type="submit"
                            id="btn_booking_confirm"
                            className="px-8 py-3 bg-rose-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-rose-700 transition-all"
                          >
                            Confirmar Agendamento ✨
                          </button>
                        </div>

                      </form>
                    )}

                    {/* Step Content 4: Success Receipt */}
                    {bookingStep === 4 && bookedReceipt && (
                      <div className="text-center space-y-6 py-6">
                        <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto border border-green-200">
                          <Check className="w-8 h-8" />
                        </div>

                        <div className="space-y-2">
                          <h4 className="text-2xl font-serif font-bold text-neutral-800">Agendamento Realizado!</h4>
                          <p className="text-sm text-neutral-500 max-w-md mx-auto">
                            Olá, <span className="font-semibold text-neutral-700">{bookedReceipt.clientName}</span>. Seu horário foi reservado no sistema e o lembrete foi agendado!
                          </p>
                        </div>

                        <div className="max-w-md border border-rose-100 bg-rose-50/20 rounded-2xl p-6 text-left mx-auto space-y-3.5">
                          <h5 className="font-serif font-bold text-sm text-[#2E1E1C] border-b border-rose-100 pb-2 flex items-center">
                            <Scissors className="w-4 h-4 mr-2 text-rose-500" /> Detalhes do Horário
                          </h5>
                          <div className="grid grid-cols-2 gap-3.5 text-xs text-neutral-600">
                            <div>
                              <p className="text-[10px] font-bold text-rose-700 uppercase">Procedimento</p>
                              <p className="font-bold text-neutral-800 mt-0.5">{bookedReceipt.procedureName}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-rose-700 uppercase">Profissional</p>
                              <p className="font-bold text-neutral-850 mt-0.5">{bookedReceipt.professionalName || "Isabel Santos"}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-rose-700 uppercase">Data Marcada</p>
                              <p className="font-bold text-neutral-800 mt-0.5">
                                {bookedReceipt.date.split('-').reverse().join('/')}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-rose-700 uppercase">Início do Procedimento</p>
                              <p className="font-bold text-neutral-800 mt-0.5">{bookedReceipt.time}h</p>
                            </div>
                          </div>
                          
                          <div className="border-t border-rose-100/60 pt-3.5 flex items-center justify-between text-xs">
                            <span className="text-neutral-400 font-bold uppercase tracking-wider text-[10px]">Total Estimado</span>
                            <span className="font-bold text-rose-600 text-sm">
                              R$ {bookedReceipt.price.toFixed(2).replace('.', ',')}
                            </span>
                          </div>
                        </div>

                        <div className="pt-4 space-x-3">
                          <button
                            onClick={resetBookingForm}
                            className="px-6 py-3 bg-neutral-100 hover:bg-neutral-200 text-[#2E1E1C] font-semibold text-xs uppercase tracking-widest rounded-xl transition-all"
                          >
                            Fazer Outro Agendamento
                          </button>
                        </div>
                      </div>
                    )}
                      </>
                    )}

                  </div>
                </section>

                {/* INSTAGRAM INSPIRATION GALLERY */}
                <section className="border-t border-rose-100 bg-rose-50/25 py-16 scroll-mt-24">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                      <div>
                        <div className="inline-flex items-center space-x-1.5 bg-rose-100/70 text-rose-700 font-bold px-3 py-1 rounded-full text-[10px] tracking-wider uppercase mb-2">
                          <Instagram className="w-3.5 h-3.5" />
                          <span>Siga @isabelsantos.naildesigner</span>
                        </div>
                        <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#2E1E1C]">
                          Inspire-se com Nossos Trabalhos
                        </h3>
                        <p className="text-neutral-500 text-xs mt-1">
                          Acompanhe as tendências de nail art, alongamentos de gel impecáveis e inspirações reais postadas diariamente.
                        </p>
                      </div>
                      
                      <a 
                        href="https://www.instagram.com/isabelsantos.naildesigner/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 px-6 py-3 bg-[#E1306C] hover:bg-[#D3225F] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-xs cursor-pointer self-start md:self-auto"
                      >
                        <Instagram className="w-4 h-4" />
                        <span>Acessar Instagram</span>
                      </a>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <a 
                        href="https://www.instagram.com/isabelsantos.naildesigner/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="group relative aspect-square rounded-2xl overflow-hidden border border-rose-100/40 shadow-xs hover:shadow-md transition-all bg-neutral-100"
                        title="Ver Post no Instagram Oficial"
                      >
                        <img 
                          src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop" 
                          alt="Banho de Gel Autoral - Naturalidade e Brilho Vitrificado" 
                          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-550"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center text-white text-xs p-3 text-center">
                          <Instagram className="w-6 h-6 mb-1 text-rose-400" />
                          <span className="font-bold">❤️ 184  💬 21</span>
                          <span className="text-[10px] opacity-95 mt-1 line-clamp-2">Banho de Gel Autoral ✨ Naturalidade e Brilho</span>
                        </div>
                      </a>

                      <a 
                        href="https://www.instagram.com/isabelsantos.naildesigner/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="group relative aspect-square rounded-2xl overflow-hidden border border-rose-100/40 shadow-xs hover:shadow-md transition-all bg-neutral-100"
                        title="Ver Post no Instagram Oficial"
                      >
                        <img 
                          src="https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=600&auto=format&fit=crop" 
                          alt="Nail Art Tartaruga Minimalista em Unha Amendoada" 
                          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-550"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center text-white text-xs p-3 text-center">
                          <Instagram className="w-6 h-6 mb-1 text-rose-400" />
                          <span className="font-bold">❤️ 256  💬 34</span>
                          <span className="text-[10px] opacity-95 mt-1 line-clamp-2">Nail Art Tartaruga Minimalista em Unha Amendoada 🐢</span>
                        </div>
                      </a>

                      <a 
                        href="https://www.instagram.com/isabelsantos.naildesigner/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="group relative aspect-square rounded-2xl overflow-hidden border border-rose-100/40 shadow-xs hover:shadow-md transition-all bg-neutral-100"
                        title="Ver Post no Instagram Oficial"
                      >
                        <img 
                          src="https://images.unsplash.com/photo-1607779097040-26e80aa78e66?q=80&w=600&auto=format&fit=crop" 
                          alt="Fórmula de Blindagem com Glitters Autênticos e Lilás" 
                          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-550"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center text-white text-xs p-3 text-center">
                          <Instagram className="w-6 h-6 mb-1 text-rose-400" />
                          <span className="font-bold">❤️ 192  💬 15</span>
                          <span className="text-[10px] opacity-95 mt-1 line-clamp-2">Blindagem com Glitters Autênticos e Lilás Delicado 🌸</span>
                        </div>
                      </a>

                      <a 
                        href="https://www.instagram.com/isabelsantos.naildesigner/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="group relative aspect-square rounded-2xl overflow-hidden border border-rose-100/40 shadow-xs hover:shadow-md transition-all bg-neutral-100"
                        title="Ver Post no Instagram Oficial"
                      >
                        <img 
                          src="https://images.unsplash.com/photo-1519014816548-bf5fe059798b?q=80&w=600&auto=format&fit=crop" 
                          alt="Cutilagem Russa impecável e esmaltação premium" 
                          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-550"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center text-white text-xs p-3 text-center">
                          <Instagram className="w-6 h-6 mb-1 text-rose-400" />
                          <span className="font-bold">❤️ 312  💬 42</span>
                          <span className="text-[10px] opacity-95 mt-1 line-clamp-2">Cutilagem Russa e Alinhamento de Esmaltação Impecável 💎</span>
                        </div>
                      </a>
                    </div>
                  </div>
                </section>

              </div>
            )}

            {/* ========================================================= */}
            {/*                  NAIL DESIGNER TRAINING COURSE            */}
            {/* ========================================================= */}
            {viewMode === 'course' && (
              <NailCourse 
                onAddClientNotification={(title, message) => {
                  const newNotify: ReminderLog = {
                    id: 'act_' + Math.random().toString(36).substring(2, 9),
                    appointmentId: '',
                    clientName: 'Inscrição de Aluna',
                    phone: 'Vendas Academia',
                    messageText: `${title} - ${message}`,
                    status: 'sent',
                    sentAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                  };
                  setReminders(prev => [...prev, newNotify]);
                }}
                onNavigateToBooking={() => {
                  setViewMode('client');
                  setTimeout(() => {
                    const el = document.getElementById('scroll_catalogo');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }, 150);
                }}
              />
            )}

            {/* ========================================================= */}
            {/*              ADMINISTRATIVE BUSINESS PORTAL (OWNER)       */}
            {/* ========================================================= */}
            {viewMode === 'admin' && !isAdminAuthenticated && (
              <div className="max-w-md mx-auto my-16 px-4">
                <div className="bg-white rounded-3xl border border-rose-100 shadow-xl p-8 space-y-6 relative overflow-hidden">
                  {/* Subtle aesthetic patterns */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-full blur-3xl -z-10"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-neutral-50 rounded-full blur-3xl -z-10"></div>

                  {/* 1. PASSWORD RESET VIEW */}
                  {isResettingPassword ? (
                    <>
                      <div className="text-center space-y-2">
                        <div className="bg-rose-100 text-rose-700 w-16 h-16 rounded-full flex items-center justify-center font-serif text-2xl font-bold tracking-wide shadow-xs border border-rose-200 mx-auto">
                          IS
                        </div>
                        <h4 className="font-serif text-2xl font-bold text-[#2E1E1C]">Definir Nova Senha</h4>
                        <p className="text-neutral-500 text-xs">
                          Crie uma nova senha de segurança para o seu acesso ao painel.
                        </p>
                      </div>

                      {resetError && (
                        <div className="p-3.5 bg-red-50 text-red-800 rounded-xl border border-red-100 flex items-start space-x-2 text-xs">
                          <AlertCircle className="w-4 h-4 text-red-650 shrink-0 mt-0.5" />
                          <span>{resetError}</span>
                        </div>
                      )}

                      {resetSuccess ? (
                        <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-100 flex items-start space-x-2.5 text-xs">
                          <CheckCircle className="w-5 h-5 text-emerald-650 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold">Sucesso!</p>
                            <p className="mt-0.5">{resetSuccess}</p>
                            <p className="mt-2 text-[10px] text-emerald-650 font-medium">Redirecionando de volta ao login...</p>
                          </div>
                        </div>
                      ) : (
                        <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                          <div>
                            <label className="block text-neutral-600 text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center space-x-1">
                              <Shield className="w-3.5 h-3.5 text-neutral-400 mr-1" />
                              <span>Nova Senha</span>
                            </label>
                            <input
                              type="password"
                              required
                              value={newPasswordInput}
                              onChange={(e) => {
                                setNewPasswordInput(e.target.value);
                                setResetError(null);
                              }}
                              placeholder="Mínimo de 4 caracteres"
                              className="w-full p-3.5 bg-neutral-50 rounded-xl border border-rose-100 text-sm focus:outline-none focus:border-rose-500 focus:bg-white transition-all placeholder:text-neutral-350 font-medium font-sans"
                            />
                          </div>

                          <div>
                            <label className="block text-neutral-600 text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center space-x-1">
                              <Shield className="w-3.5 h-3.5 text-neutral-400 mr-1" />
                              <span>Confirmar Nova Senha</span>
                            </label>
                            <input
                              type="password"
                              required
                              value={confirmNewPasswordInput}
                              onChange={(e) => {
                                setConfirmNewPasswordInput(e.target.value);
                                setResetError(null);
                              }}
                              placeholder="Repita a nova senha"
                              className="w-full p-3.5 bg-neutral-50 rounded-xl border border-rose-100 text-sm focus:outline-none focus:border-rose-500 focus:bg-white transition-all placeholder:text-neutral-350 font-medium font-sans"
                            />
                          </div>

                          <button
                            type="submit"
                            id="btn_submit_reset_password"
                            className="w-full py-4 bg-neutral-800 hover:bg-neutral-900 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer"
                          >
                            <span>Salvar Nova Senha</span>
                            <Check className="w-4 h-4" />
                          </button>
                        </form>
                      )}

                      <div className="pt-2 border-t border-rose-50/70 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setIsResettingPassword(false);
                            setIsRecovering(false);
                            setResetError(null);
                          }}
                          className="text-xs text-neutral-500 hover:text-neutral-800 font-medium transition-all"
                        >
                          Cancelar e Voltar ao Login
                        </button>
                      </div>
                    </>
                  ) : isRecovering ? (
                    /* 2. FORGOT PASSWORD / RECOVERY VIEW */
                    <>
                      <div className="text-center space-y-2">
                        <div className="bg-rose-100 text-rose-700 w-16 h-16 rounded-full flex items-center justify-center font-serif text-2xl font-bold tracking-wide shadow-xs border border-rose-200 mx-auto">
                          IS
                        </div>
                        <h4 className="font-serif text-2xl font-bold text-[#2E1E1C]">Recuperar Senha</h4>
                        <p className="text-neutral-500 text-xs">
                          Insira seu e-mail ou telefone de cadastro para receber o link de redefinição.
                        </p>
                      </div>

                      {loginError && (
                        <div className="p-3.5 bg-red-50 text-red-800 rounded-xl border border-red-100 flex items-start space-x-2 text-xs">
                          <AlertCircle className="w-4 h-4 text-red-650 shrink-0 mt-0.5" />
                          <span>{loginError}</span>
                        </div>
                      )}

                      {recoverySuccess ? (
                        <div className="space-y-4">
                          <div className="p-3.5 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-100 flex items-start space-x-2 text-xs">
                            <CheckCircle className="w-4 h-4 text-emerald-650 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-bold">Link Emitido!</p>
                              <p className="mt-0.5">{recoverySuccess}</p>
                            </div>
                          </div>

                          {generatedLink && (
                            <div className="bg-rose-50/50 border border-rose-100 p-4 rounded-2xl space-y-3">
                              <p className="text-[11px] text-rose-900 font-bold flex items-center">
                                <Sparkles className="w-3.5 h-3.5 text-rose-500 mr-1.5 shrink-0 animate-pulse" />
                                Canal de Atendimento (Mensagem):
                              </p>
                              <p className="text-[10px] text-neutral-600 leading-relaxed">
                                Como está em ambiente de testes, o sistema simulou o envio do link de reinicialização de senha. Clique no botão abaixo para usar o link recebido e definir a nova senha diretamente:
                              </p>
                              
                              <button
                                type="button"
                                onClick={() => {
                                  setIsResettingPassword(true);
                                  setIsRecovering(false);
                                  setRecoverySuccess(null);
                                  setGeneratedLink(null);
                                }}
                                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Acessar Link Recebido</span>
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                          <div>
                            <label className="block text-neutral-600 text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center space-x-1">
                              <Mail className="w-3.5 h-3.5 text-neutral-400 mr-1" />
                              <span>E-mail ou Fone Celular</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={recoveryEmailInput}
                              onChange={(e) => {
                                setRecoveryEmailInput(e.target.value);
                                setLoginError(null);
                              }}
                              placeholder="seu-email@exemplo.com ou telefone"
                              className="w-full p-3.5 bg-neutral-50 rounded-xl border border-rose-100 text-sm focus:outline-none focus:border-rose-500 focus:bg-white transition-all placeholder:text-neutral-350 font-medium font-sans"
                            />
                          </div>

                          <button
                            type="submit"
                            id="btn_submit_forgot_password"
                            className="w-full py-4 bg-neutral-800 hover:bg-neutral-900 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer"
                          >
                            <span>Receber Link de Acesso</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </form>
                      )}

                      <div className="pt-2 border-t border-rose-50/70 text-center flex flex-col space-y-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsRecovering(false);
                            setLoginError(null);
                            setRecoverySuccess(null);
                            setGeneratedLink(null);
                          }}
                          className="text-xs text-rose-600 hover:text-rose-700 font-semibold transition-all"
                        >
                          Voltar ao Login do Gestor
                        </button>
                      </div>
                    </>
                  ) : (
                    /* 3. STANDARD LOGIN VIEW */
                    <>
                      <div className="text-center space-y-2">
                        <div className="bg-rose-100 text-rose-700 w-16 h-16 rounded-full flex items-center justify-center font-serif text-2xl font-bold tracking-wide shadow-xs border border-rose-200 mx-auto">
                          IS
                        </div>
                        <h4 className="font-serif text-2xl font-bold text-[#2E1E1C]">Painel do Gestor</h4>
                        <p className="text-neutral-500 text-xs">
                          Insira as credenciais administrativas para gerenciar clientes, agendamentos e finanças.
                        </p>
                      </div>

                      {loginError && (
                        <div className="p-3.5 bg-red-50 text-red-800 rounded-xl border border-red-100 flex items-start space-x-2 text-xs">
                          <AlertCircle className="w-4 h-4 text-red-650 shrink-0 mt-0.5" />
                          <span>{loginError}</span>
                        </div>
                      )}

                      <form onSubmit={handleAdminLogin} className="space-y-4">
                        <div>
                          <label className="block text-neutral-600 text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center space-x-1">
                            <Users className="w-3.5 h-3.5 text-neutral-400 mr-1" />
                            <span>Usuário</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={usernameInput}
                            onChange={(e) => {
                              setUsernameInput(e.target.value);
                              setLoginError(null);
                            }}
                            placeholder="Digite seu usuário"
                            className="w-full p-3.5 bg-neutral-50 rounded-xl border border-rose-100 text-sm focus:outline-none focus:border-rose-500 focus:bg-white transition-all placeholder:text-neutral-350 font-medium font-sans"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-neutral-600 text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1">
                              <Shield className="w-3.5 h-3.5 text-neutral-400 mr-1" />
                              <span>Senha</span>
                            </label>
                            
                            <button
                              type="button"
                              onClick={() => {
                                setIsRecovering(true);
                                setLoginError(null);
                                setRecoverySuccess(null);
                                setGeneratedLink(null);
                                setRecoveryEmailInput('');
                              }}
                              className="text-[10px] text-rose-600 hover:text-rose-700 font-bold transition-all focus:outline-none"
                            >
                              Esqueceu a senha?
                            </button>
                          </div>
                          
                          <input
                            type="password"
                            required
                            value={passwordInput}
                            onChange={(e) => {
                              setPasswordInput(e.target.value);
                              setLoginError(null);
                            }}
                            placeholder="Digite sua senha"
                            className="w-full p-3.5 bg-neutral-50 rounded-xl border border-rose-100 text-sm focus:outline-none focus:border-rose-500 focus:bg-white transition-all placeholder:text-neutral-350 font-medium font-sans"
                          />
                        </div>

                        <button
                          type="submit"
                          id="btn_submit_login"
                          className="w-full py-4 bg-neutral-800 hover:bg-neutral-900 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer"
                        >
                          <span>Acessar Painel</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </form>

                      <div className="pt-2 border-t border-rose-50/70 text-center space-y-3">
                        <button
                          type="button"
                          onClick={() => setViewMode('client')}
                          className="text-xs text-neutral-500 hover:text-neutral-800 font-medium transition-all"
                        >
                          ← Voltar para Área da Cliente
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {viewMode === 'admin' && isAdminAuthenticated && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                
                {/* Board Heading */}
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-rose-100 pb-8 mb-8 gap-4">
                  <div>
                    <span className="text-[10px] tracking-widest uppercase text-rose-600 font-extrabold flex items-center">
                      <UserCheck className="w-3.5 h-3.5 mr-1" /> Portal Empresarial
                    </span>
                    <h2 className="font-serif text-3xl font-extrabold text-[#2F1F1D] tracking-tight mt-1">
                      Gerenciamento Geral de Negócios
                    </h2>
                    <p className="text-neutral-400 text-xs mt-1">
                      Controle de CRM, fluxo de caixa, agendamentos ativos e inteligência artificial para marketing.
                    </p>
                  </div>

                  {/* Operational indicators shortcut and Logout Button */}
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center space-x-4 bg-white px-5 py-3 rounded-2xl border border-rose-100 shadow-3xs">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-[11px] font-bold uppercase text-neutral-400 tracking-wider">Lembretes Automáticos</span>
                      </div>
                      <div className="h-6 w-px bg-rose-50"></div>
                      <div className="text-xs text-neutral-600">
                        Total Clientes: <span className="font-bold text-neutral-900">{clients.length}</span>
                      </div>
                    </div>

                    <button
                      id="btn_admin_logout"
                      onClick={handleAdminLogout}
                      className="px-5 py-3 bg-red-50 text-red-700 hover:bg-rose-600 hover:text-white rounded-2xl border border-red-100 hover:border-transparent font-bold text-xs uppercase tracking-wider transition-all flex items-center space-x-1.5 cursor-pointer shadow-3xs"
                      title="Sair do painel administrativo"
                    >
                      <X className="w-4 h-4 shrink-0" />
                      <span>Sair do Painel</span>
                    </button>
                  </div>
                </div>

                {/* TAB SWITCH BAR */}
                <div className="flex items-center border-b border-rose-100/50 mb-8 overflow-x-auto space-x-2 scrollbar-none">
                  <button
                    id="tab_appointments"
                    onClick={() => setAdminTab('appointments')}
                    className={`pb-4 px-4 text-xs font-bold uppercase tracking-wider flex items-center space-x-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                      adminTab === 'appointments'
                        ? 'border-rose-600 text-rose-700'
                        : 'border-transparent text-neutral-450 hover:text-[#2F1F1D] pb-4'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Agenda de Serviços</span>
                    <span className="bg-rose-50 text-rose-700 ml-1.5 px-2 py-0.5 rounded-full font-sans text-[10px] font-semibold border border-rose-100">
                      {appointments.filter(a => a.status === 'pending').length}
                    </span>
                  </button>

                  <button
                    id="tab_crm"
                    onClick={() => setAdminTab('crm')}
                    className={`pb-4 px-4 text-xs font-bold uppercase tracking-wider flex items-center space-x-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                      adminTab === 'crm'
                        ? 'border-rose-600 text-rose-700'
                        : 'border-transparent text-neutral-450 hover:text-[#2F1F1D] pb-4'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>CRM de Clientes</span>
                    <span className="bg-neutral-100 text-neutral-700 ml-1.5 px-2 py-0.5 rounded-full font-sans text-[10px] font-semibold">
                      {clients.length}
                    </span>
                  </button>

                  <button
                    id="tab_finance"
                    onClick={() => setAdminTab('finance')}
                    className={`pb-4 px-4 text-xs font-bold uppercase tracking-wider flex items-center space-x-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                      adminTab === 'finance'
                        ? 'border-rose-600 text-rose-700'
                        : 'border-transparent text-neutral-450 hover:text-[#2F1F1D] pb-4'
                    }`}
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>Gestão Financeira</span>
                  </button>

                  <button
                    id="tab_reminders"
                    onClick={() => setAdminTab('reminders')}
                    className={`pb-4 px-4 text-xs font-bold uppercase tracking-wider flex items-center space-x-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                      adminTab === 'reminders'
                        ? 'border-rose-600 text-rose-700'
                        : 'border-transparent text-neutral-450 hover:text-[#2F1F1D] pb-4'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Lembretes por WhatsApp</span>
                    <span className="bg-rose-50 text-rose-700 ml-1.5 px-2 py-0.5 rounded-full font-sans text-[10px] font-semibold">
                      {appointments.filter(a => a.status === 'pending').length}
                    </span>
                  </button>

                  <button
                    id="tab_supabase"
                    onClick={() => setAdminTab('supabase')}
                    className={`pb-4 px-4 text-xs font-bold uppercase tracking-wider flex items-center space-x-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                      adminTab === 'supabase'
                        ? 'border-[#3ecf8e] text-[#3ecf8e]'
                        : 'border-transparent text-neutral-450 hover:text-[#3ecf8e] pb-4'
                    }`}
                  >
                    <Database className="w-4 h-4" />
                    <span>Banco Supabase</span>
                    <span className={`text-[9px] font-extrabold uppercase ml-1 pb-0.5 px-1.5 rounded ${
                      dbStatus?.status === 'supabase_active' 
                        ? 'bg-[#3ecf8e]/10 text-[#3ecf8e]' 
                        : 'bg-neutral-100 text-neutral-500'
                    }`}>
                      {dbStatus?.status === 'supabase_active' ? 'Ativo' : 'Local'}
                    </span>
                  </button>
                </div>

                {/* TAB CONTENT: 1. AGENDA DE SERVICOS */}
                {adminTab === 'appointments' && (
                  <div className="space-y-6">
                    
                    {/* Header bar within tab */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-rose-100/60 shadow-xs">
                      
                      {/* Interactive Calendar/Date filters in Admin */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-neutral-600 uppercase mr-2">Filtrar por data:</span>
                        <button
                          onClick={() => setAptDateFilter('')}
                          className={`px-4 py-1.5 rounded-lg text-xs font-bold ${
                            aptDateFilter === '' 
                              ? 'bg-rose-600 text-white shadow-xs' 
                              : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                          }`}
                        >
                          Ver Tudo
                        </button>
                        
                        <button
                          onClick={() => setAptDateFilter(new Date().toISOString().split('T')[0])}
                          className={`px-4 py-1.5 rounded-lg text-xs font-bold ${
                            aptDateFilter === new Date().toISOString().split('T')[0] 
                              ? 'bg-rose-600 text-white shadow-xs' 
                              : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                          }`}
                        >
                          Hoje ({new Date().toLocaleDateString('pt-BR', {day:'2-digit', month: '2-digit'})})
                        </button>

                        <button
                          onClick={() => {
                            const tom = new Date();
                            tom.setDate(tom.getDate() + 1);
                            setAptDateFilter(tom.toISOString().split('T')[0]);
                          }}
                          className={`px-4 py-1.5 rounded-lg text-xs font-bold ${
                            aptDateFilter === new Date(new Date().setDate(new Date().getDate()+1)).toISOString().split('T')[0]
                              ? 'bg-rose-600 text-white shadow-xs' 
                              : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                          }`}
                        >
                          Amanhã
                        </button>

                        <input 
                          type="date"
                          value={aptDateFilter}
                          onChange={(e) => setAptDateFilter(e.target.value)}
                          className="px-3 py-1 bg-white border border-rose-150 rounded-lg text-xs font-medium focus:outline-none"
                        />
                      </div>

                      <div className="text-xs text-neutral-400 font-medium">
                        Agendamentos Ativos Encontrados: {" "}
                        <span className="font-bold text-neutral-855">
                          {appointments.filter(a => !aptDateFilter || a.date === aptDateFilter).length}
                        </span>
                      </div>

                    </div>

                    {/* Bookings Table / Cards Grid */}
                    {appointments.filter(a => !aptDateFilter || a.date === aptDateFilter).length === 0 ? (
                      <div className="bg-white rounded-2xl border border-dashed border-rose-100 p-12 text-center text-neutral-400">
                        <CalendarCheck className="w-10 h-10 text-rose-200 mx-auto mb-3" />
                        <h4 className="font-bold text-sm text-neutral-700">Sem agendamentos registrados</h4>
                        <p className="text-xs mt-1 max-w-sm mx-auto">Não há nenhum horário agendado que corresponda a este dia selecionado no filtro.</p>
                      </div>
                    ) : (
                      <div className="bg-white rounded-2xl border border-rose-150/50 shadow-xs overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-rose-50/50 text-[10px] font-bold text-rose-900 uppercase tracking-wider border-b border-rose-100">
                                <th className="p-4">Cliente / Contato</th>
                                <th className="p-4">Procedimento / Custo</th>
                                <th className="p-4">Data & Horário</th>
                                <th className="p-4">Anotações</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Ações Rápidas</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-rose-50 text-xs">
                              {appointments.filter(a => !aptDateFilter || a.date === aptDateFilter).map((apt) => (
                                <tr key={apt.id} className="hover:bg-rose-50/10">
                                  
                                  {/* Client names */}
                                  <td className="p-4">
                                    <p className="font-bold text-neutral-900">{apt.clientName}</p>
                                    <p className="text-[10px] text-neutral-450 mt-1 flex items-center">
                                      <Phone className="w-3 h-3 mr-1 text-rose-400" /> {apt.clientPhone}
                                    </p>
                                  </td>

                                  {/* Procedure Details */}
                                  <td className="p-4">
                                    <div className="flex flex-wrap items-center gap-1.5">
                                      <p className="font-semibold text-neutral-800">{apt.procedureName}</p>
                                      <span className={`text-[9px] px-1.5 py-0.5 font-bold rounded uppercase tracking-wider ${
                                        (apt.professionalName || "Isabel Santos") === 'Isabel Santos'
                                          ? 'bg-rose-50 text-rose-700 border border-rose-100'
                                          : 'bg-teal-50 text-teal-850 border border-teal-100'
                                      }`}>
                                        👤 {apt.professionalName || "Isabel Santos"}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-rose-600 font-bold mt-1">R$ {apt.price.toFixed(2).replace('.', ',')}</p>
                                  </td>

                                  {/* Schedule */}
                                  <td className="p-4">
                                    <p className="font-medium text-neutral-700">
                                      {apt.date.split('-').reverse().join('/')}
                                    </p>
                                    <span className="inline-block mt-1 bg-rose-50 text-rose-800 border border-rose-100 font-bold px-2 py-0.5 rounded text-[9px]">
                                      🕒 {apt.time}h
                                    </span>
                                  </td>

                                  {/* Notes field */}
                                  <td className="p-4 text-neutral-500 max-w-[200px] truncate" title={apt.notes}>
                                    {apt.notes || <span className="text-neutral-350 italic">Sem anotações</span>}
                                  </td>

                                  {/* Status Pills */}
                                  <td className="p-4">
                                    {apt.status === 'pending' && (
                                      <span className="inline-flex items-center px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200 rounded-full">
                                        Pendente
                                      </span>
                                    )}
                                    {apt.status === 'completed' && (
                                      <span className="inline-flex items-center px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-green-800 bg-green-50 border border-green-200 rounded-full">
                                        Concluído
                                      </span>
                                    )}
                                    {apt.status === 'cancelled' && (
                                      <span className="inline-flex items-center px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-red-800 bg-red-50 border border-red-200 rounded-full">
                                        Cancelado
                                      </span>
                                    )}
                                  </td>

                                  {/* Controls */}
                                  <td className="p-4 text-right space-x-1 whitespace-nowrap">
                                    {apt.status === 'pending' && (
                                      <>
                                        <button
                                          id={`btn_complete_apt_${apt.id}`}
                                          onClick={() => handleUpdateStatus(apt.id, 'completed')}
                                          className="p-1 px-3.5 bg-emerald-550 hover:bg-emerald-600 text-white font-bold text-[10px] uppercase rounded-lg transition-all"
                                          title="Marcar como atendida (Lança no financeiro)"
                                        >
                                          ✓ Atendida
                                        </button>
                                        <button
                                          id={`btn_cancel_apt_${apt.id}`}
                                          onClick={() => handleUpdateStatus(apt.id, 'cancelled')}
                                          className="p-1 px-2.5 border border-red-100 hover:border-red-400 text-red-650 hover:bg-red-50 font-bold text-[10px] uppercase rounded-lg transition-all"
                                          title="Cancelar horário"
                                        >
                                          ✕ Cancelar
                                        </button>
                                      </>
                                    )}
                                    
                                    {/* Action to preview or generate reminder directly */}
                                    {apt.status === 'pending' && (
                                      <button
                                        onClick={() => {
                                          setAdminTab('reminders');
                                          handleGenerateAIReminder(apt);
                                        }}
                                        className="inline-flex items-center p-1.5 ml-2 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg "
                                        title="Gerar Lembrete Inteligente via WhatsApp"
                                      >
                                        <MessageSquare className="w-3.5 h-3.5" />
                                      </button>
                                    )}

                                    {apt.status !== 'pending' && (
                                      <span className="text-neutral-350 italic text-[11px] pr-4">Histórico</span>
                                    )}
                                  </td>

                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                  </div>
                )}

                {/* TAB CONTENT: 2. CRM DE CLIENTES */}
                {adminTab === 'crm' && (
                  <div className="space-y-6">
                    
                    {/* CRM Header Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      
                      {/* Search client input */}
                      <div className="relative max-w-sm w-full">
                        <input
                          type="text"
                          placeholder="Pesquisar por nome ou celular..."
                          value={crmSearch}
                          onChange={(e) => setCrmSearch(e.target.value)}
                          className="w-full pl-5 pr-12 py-3 bg-white rounded-xl border border-rose-100 text-xs focus:outline-none focus:border-rose-500 shadow-3xs"
                        />
                      </div>

                      <button
                        onClick={() => setShowAddClientModal(true)}
                        className="px-6 py-3 bg-neutral-800 text-white hover:bg-neutral-900 border-none font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer shadow-3xs"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Adicionar Nova Cliente</span>
                      </button>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Left: CRM List */}
                      <div className="md:col-span-2 space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                          Carteira de Clientes ({crmFilteredClients.length})
                        </h4>

                        <div className="grid grid-cols-1 gap-3.5">
                          {crmFilteredClients.map(client => (
                            <div 
                              key={client.id}
                              id={`client_card_${client.id}`}
                              onClick={() => setSelectedClientDetail(client)}
                              className={`p-4 bg-white rounded-2xl border transition-all cursor-pointer hover:border-rose-450 ${
                                selectedClientDetail?.id === client.id 
                                  ? 'border-rose-600 bg-rose-50/10 shadow-xs' 
                                  : 'border-rose-100 shadow-3xs'
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                  <p className="font-bold text-[#2E1E1C] text-sm">{client.name}</p>
                                  <p className="text-neutral-500 text-xs flex items-center">
                                    <Phone className="w-3.5 h-3.5 text-rose-300 mr-1.5" />
                                    {client.phone}
                                  </p>
                                  {client.email && (
                                    <p className="text-neutral-500 text-[10px] flex items-center">
                                      <Mail className="w-3.5 h-3.5 text-rose-350 mr-1.5" />
                                      {client.email}
                                    </p>
                                  )}
                                  {client.birthDate && (
                                    <p className="text-neutral-500 text-[10px] flex items-center">
                                      <Calendar className="w-3.5 h-3.5 text-rose-350 mr-1.5" />
                                      Nasc: {client.birthDate.split('-').reverse().join('/')}
                                    </p>
                                  )}
                                </div>

                                <div className="text-right shrink-0">
                                  <span className="text-[10px] font-bold text-rose-700 uppercase block">Visitas</span>
                                  <span className="font-serif font-bold text-neutral-8CC text-sm">{client.totalVisits}</span>
                                </div>
                              </div>

                              <div className="border-t border-rose-50/50 mt-3 pt-3 flex items-center justify-between text-[11px] text-neutral-600">
                                <span className="text-[10px] text-neutral-400">Desde {client.createdAt.split('-').reverse().join('/')}</span>
                                <span className="font-semibold text-neutral-800">
                                  Gastos Acumulados: <span className="text-rose-750 font-bold">R$ {client.totalSpent.toFixed(2).replace('.', ',')}</span>
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right: Client Details & Historical visits file */}
                      <div>
                        {selectedClientDetail ? (
                          <div className="bg-white rounded-2xl border border-rose-100 p-5 shadow-xs sticky top-24 space-y-5">
                            
                            <div className="flex items-start justify-between">
                              <div>
                                <span className="text-[10px] tracking-wider uppercase font-bold text-rose-600">Ficha da Cliente</span>
                                <h4 className="font-serif text-lg font-bold text-[#2E1E1C] mt-1">{selectedClientDetail.name}</h4>
                              </div>
                              <button 
                                onClick={() => setSelectedClientDetail(null)}
                                className="text-neutral-400 hover:text-neutral-600 p-1"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>

                            <div className="bg-rose-50/20 p-4 rounded-xl border border-rose-100 text-xs space-y-2.5 text-neutral-650">
                              <p className="flex items-center justify-between">
                                <span className="font-semibold">Telefone:</span>
                                <span className="font-bold text-neutral-800">{selectedClientDetail.phone}</span>
                              </p>
                              {selectedClientDetail.email && (
                                <p className="flex items-center justify-between">
                                  <span className="font-semibold">Email:</span>
                                  <span>{selectedClientDetail.email}</span>
                                </p>
                              )}
                              {selectedClientDetail.birthDate && (
                                <p className="flex items-center justify-between">
                                  <span className="font-semibold">Data de Nascimento:</span>
                                  <span className="font-bold text-[#2E1E1C]">{selectedClientDetail.birthDate.split('-').reverse().join('/')}</span>
                                </p>
                              )}
                              <p className="flex items-center justify-between">
                                <span className="font-semibold">Acumulado total:</span>
                                <span className="font-bold text-rose-700">R$ {selectedClientDetail.totalSpent.toFixed(2).replace('.', ',')}</span>
                              </p>
                              <p className="flex items-center justify-between">
                                <span className="font-semibold">Total Consultas:</span>
                                <span className="font-bold text-neutral-800">{selectedClientDetail.totalVisits}</span>
                              </p>
                            </div>

                            {/* Client Clinical/Nails preference profile notes */}
                            <div>
                              <label className="text-[10px] uppercase tracking-wider font-bold text-neutral-500 block mb-1.5">
                                Perfil Clínico & Preferências de Unhas
                              </label>
                              <textarea
                                id={`edit_client_notes_${selectedClientDetail.id}`}
                                defaultValue={selectedClientDetail.notes || ''}
                                onBlur={(e) => handleSaveClientNotes(selectedClientDetail.id, e.target.value)}
                                placeholder="Registre sensibilidades, materiais mais usados, tipo de gel favorito, cores que mais gosta nas mãos..."
                                className="w-full p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-700 focus:outline-none focus:bg-white focus:border-rose-350"
                                rows={4}
                              />
                              <p className="text-[10px] text-neutral-400 mt-1 italic">
                                * Pressione fora do campo para salvar as anotações automaticamente.
                              </p>
                            </div>

                            {/* Service visit history */}
                            <div className="space-y-3">
                              <span className="text-[10px] uppercase tracking-wider font-bold text-neutral-500 block">
                                Histórico de Atendimentos
                              </span>

                              {appointments.filter(a => a.clientId === selectedClientDetail.id).length === 0 ? (
                                <p className="text-[11px] text-neutral-400 italic">Nenhum atendimento registrado no histórico.</p>
                              ) : (
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                  {appointments
                                    .filter(a => a.clientId === selectedClientDetail.id)
                                    .reverse()
                                    .map(apt => (
                                      <div key={apt.id} className="p-3 bg-neutral-50 rounded-xl border border-rose-50 flex justify-between items-center text-xs">
                                        <div>
                                          <p className="font-semibold text-neutral-800">{apt.procedureName}</p>
                                          <p className="text-[10px] text-neutral-400">{apt.date.split('-').reverse().join('/')} • {apt.time}h</p>
                                        </div>
                                        <div>
                                          {apt.status === 'completed' ? (
                                            <span className="bg-green-150 text-green-700 font-bold px-2 py-0.5 rounded text-[9px] uppercase">✓ Efetuado</span>
                                          ) : apt.status === 'cancelled' ? (
                                            <span className="bg-red-50 text-red-700 font-medium px-2 py-0.5 rounded text-[9px] uppercase">✕ Cancelado</span>
                                          ) : (
                                            <span className="bg-amber-100 text-amber-700 font-medium px-2 py-0.5 rounded text-[9px] uppercase">Pendente</span>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              )}
                            </div>

                          </div>
                        ) : (
                          <div className="bg-rose-50/20 rounded-2xl border border-dashed border-rose-100 p-8 text-center text-neutral-400 sticky top-24">
                            <Info className="w-8 h-8 text-rose-300 mx-auto mb-2" />
                            <h5 className="font-bold text-xs text-neutral-700">Filtro de Detalhes</h5>
                            <p className="text-[10px] mt-1 text-center max-w-xs mx-auto">Selecione qualquer cliente listada ao lado para carregar sua ficha de acompanhamento.</p>
                          </div>
                        )}
                      </div>

                    </div>

                  </div>
                )}

                {/* TAB CONTENT: 3. GESTAO FINANCEIRA */}
                {adminTab === 'finance' && (
                  <div className="space-y-8">
                    
                    {/* Sub-Tabs Picker */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-rose-100/60 gap-4">
                      <div>
                        <h3 className="font-serif font-extrabold text-neutral-850 text-xl">Controle Financeiro</h3>
                        <p className="text-xs text-neutral-400 mt-0.5">Faturamento, compras de matéria-prima e controle de gastos recorrentes do estúdio.</p>
                      </div>
                      <div className="flex bg-rose-50/70 p-1 rounded-xl border border-rose-100/60 self-start sm:self-auto shrink-0 select-none">
                        <button
                          onClick={() => setFinanceSubTab('overview')}
                          className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center space-x-1.5 ${
                            financeSubTab === 'overview' ? 'bg-rose-500 text-white shadow-xs bg-[#db2777]' : 'text-neutral-500 hover:text-neutral-800'
                          }`}
                        >
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span>Métricas & Extrato</span>
                        </button>
                        <button
                          onClick={() => setFinanceSubTab('raw-materials')}
                          className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center space-x-1.5 ${
                            financeSubTab === 'raw-materials' ? 'bg-rose-500 text-white shadow-xs bg-[#db2777]' : 'text-neutral-500 hover:text-neutral-800'
                          }`}
                        >
                          <Package className="w-3.5 h-3.5" />
                          <span>Matéria-Prima</span>
                        </button>
                        <button
                          onClick={() => setFinanceSubTab('recurring')}
                          className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center space-x-1.5 ${
                            financeSubTab === 'recurring' ? 'bg-rose-500 text-white shadow-xs bg-[#db2777]' : 'text-neutral-500 hover:text-neutral-800'
                          }`}
                        >
                          <Repeat className="w-3.5 h-3.5" />
                          <span>Contas Recorrentes</span>
                        </button>
                      </div>
                    </div>

                    {/* ======================= SUB-TAB: OVERVIEW ======================= */}
                    {financeSubTab === 'overview' && (
                      <div className="space-y-8">
                        {/* Financial Dashboard Key metrics cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                          
                          {/* Gross Billing */}
                          <div className="bg-white rounded-2xl p-5 border border-rose-100 shadow-3xs flex items-center space-x-4">
                            <div className="bg-emerald-550/10 text-emerald-555 p-3.5 rounded-xl shrink-0">
                              <TrendingUp className="w-6 h-6" />
                            </div>
                            <div>
                              <span className="text-[10px] tracking-wider uppercase text-neutral-400 font-bold block">Faturamento Bruto</span>
                              <span className="font-serif font-extrabold text-neutral-850 text-xl">
                                R$ {financeStats.incomes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          </div>

                          {/* Cumulative Supply Cost */}
                          <div className="bg-white rounded-2xl p-5 border border-rose-100 shadow-3xs flex items-center space-x-4">
                            <div className="bg-red-550/10 text-red-555 p-3.5 rounded-xl shrink-0">
                              <TrendingDown className="w-6 h-6" />
                            </div>
                            <div>
                              <span className="text-[10px] tracking-wider uppercase text-neutral-400 font-bold block">Custos & Despesas</span>
                              <span className="font-serif font-extrabold text-neutral-850 text-xl text-red-650">
                                R$ {financeStats.expenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          </div>

                          {/* Profit Margin */}
                          <div className="bg-white rounded-2xl p-5 border border-rose-100 shadow-3xs flex items-center space-x-4">
                            <div className="bg-blue-50 text-blue-700 p-3.5 rounded-xl shrink-0">
                              <DollarSign className="w-6 h-6" />
                            </div>
                            <div>
                              <span className="text-[10px] tracking-wider uppercase text-neutral-400 font-bold block">Lucro Líquido</span>
                              <span className="font-serif font-extrabold text-emerald-700 text-xl">
                                R$ {financeStats.profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          </div>

                          {/* Average procedure Ticket */}
                          <div className="bg-white rounded-2xl p-5 border border-rose-100 shadow-3xs flex items-center space-x-4">
                            <div className="bg-amber-50 text-amber-700 p-3.5 rounded-xl shrink-0">
                              <Scissors className="w-6 h-6" />
                            </div>
                            <div>
                              <span className="text-[10px] tracking-wider uppercase text-neutral-400 font-bold block">Ticket Médio</span>
                              <span className="font-serif font-extrabold text-neutral-850 text-xl">
                                R$ {financeStats.avgTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          </div>

                        </div>

                        {/* Visualização de Gráficos e Analytics */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          
                          {/* Recharts area chart - Month by month comparison */}
                          <div className="lg:col-span-2 bg-white rounded-2xl border border-rose-100 p-5 shadow-3xs">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-6 font-serif">
                              Detalhamento de Faturamento e Custos (2026)
                            </h4>
                            
                            <div className="h-72 w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                  data={getChartDataByMonth()}
                                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                                >
                                  <defs>
                                    <linearGradient id="colorIncomes" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#db2777" stopOpacity={0.2}/>
                                      <stop offset="95%" stopColor="#db2777" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                    </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                  <XAxis dataKey="name" fontSize={11} stroke="#9ca3af" />
                                  <YAxis fontSize={11} stroke="#9ca3af" />
                                  <Tooltip formatter={(value) => `R$ ${value}`} />
                                  <Legend wrapperStyle={{ fontSize: 11 }} />
                                  <Area type="monotone" dataKey="Faturamento" stroke="#db2777" strokeWidth={2} fillOpacity={1} fill="url(#colorIncomes)" />
                                  <Area type="monotone" dataKey="Custos" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExpenses)" />
                                </AreaChart>
                              </ResponsiveContainer>
                            </div>
                          </div>

                          {/* Recharts pie chart - Expense distribution by category */}
                          <div className="bg-white rounded-2xl border border-rose-100 p-5 shadow-3xs flex flex-col justify-between">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-4 font-serif">
                              Distribuição de Custos por Categoria
                            </h4>
                            
                            <div className="h-72 w-full flex flex-col justify-between">
                              {getExpensePieData().length > 0 ? (
                                <>
                                  <div className="h-44 w-full relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                      <PieChart>
                                        <Pie
                                          data={getExpensePieData()}
                                          cx="50%"
                                          cy="50%"
                                          innerRadius={55}
                                          outerRadius={80}
                                          paddingAngle={3}
                                          dataKey="value"
                                        >
                                          {getExpensePieData().map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                          ))}
                                        </Pie>
                                        <Tooltip 
                                          formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
                                          contentStyle={{ fontSize: 10, borderRadius: 8, borderColor: '#fecdd3' }}
                                        />
                                      </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                      <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wide">Total Custos</span>
                                      <span className="text-xs font-extrabold font-serif text-red-650">
                                        R$ {financeStats.expenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  {/* Descriptive list legend */}
                                  <div className="grid grid-cols-2 gap-x-2.5 gap-y-1.5 text-[9px] mt-2 overflow-y-auto max-h-20 select-none">
                                    {getExpensePieData().map((entry, index) => {
                                      const percentage = ((entry.value / (financeStats.expenses || 1)) * 100).toFixed(1);
                                      return (
                                        <div key={entry.name} className="flex items-center space-x-1.5 min-w-0" title={`${entry.name}: R$ ${entry.value}`}>
                                          <span 
                                            className="w-1.5 h-1.5 rounded-full shrink-0" 
                                            style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                                          />
                                          <span className="text-neutral-600 truncate font-semibold block">{entry.name}</span>
                                          <span className="text-neutral-400 font-medium">({percentage}%)</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </>
                              ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                                  <Info className="w-8 h-8 text-neutral-300 mb-2" />
                                  <p className="text-xs text-neutral-500 font-medium font-serif">Nenhum custo registrado</p>
                                  <p className="text-[10px] text-neutral-400 mt-1 leading-relaxed">Adicione uma despesa manual para preencher o gráfico de setores.</p>
                                </div>
                              )}
                            </div>
                          </div>

                        </div>

                        {/* Lançamento e Extrato Financeiro */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          
                          {/* Form panel for manual transaction */}
                          <div className="bg-white rounded-2xl border border-rose-100 p-5 shadow-3xs flex flex-col justify-between">
                            <div>
                              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-4 font-serif">
                                Lançar Movimentação Manual
                              </h4>
                              <p className="text-[11px] text-neutral-400 mb-4 leading-relaxed">Use esta seção para declarar despesas extras (aluguel, manutenção de cabine UV, esmaltes) ou receitas manuais fora do agendador.</p>
                              
                              <form onSubmit={handleAddFinance} className="space-y-3">
                                <div className="flex bg-rose-50 p-1.5 rounded-lg border border-rose-100 font-sans">
                                  <button
                                    type="button"
                                    onClick={() => setFinType('income')}
                                    className={`flex-1 text-center py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                                      finType === 'income' ? 'bg-white text-emerald-800 shadow-3xs' : 'text-neutral-500'
                                    }`}
                                  >
                                    Receita (+)
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setFinType('expense')}
                                    className={`flex-1 text-center py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                                      finType === 'expense' ? 'bg-white text-red-800 shadow-3xs' : 'text-neutral-500'
                                    }`}
                                  >
                                    Despesa (-)
                                  </button>
                                </div>

                                <div>
                                  <label className="text-[10px] uppercase font-bold text-neutral-500 block mb-1">Valor do Lançamento *</label>
                                  <input
                                    type="number"
                                    required
                                    value={finAmount}
                                    onChange={(e) => setFinAmount(e.target.value)}
                                    placeholder="R$ 150,00"
                                    className="w-full px-3 py-2 bg-neutral-50 rounded-lg border border-rose-100 text-xs focus:outline-none"
                                  />
                                </div>

                                <div>
                                  <label className="text-[10px] uppercase font-bold text-neutral-500 block mb-1">Categoria *</label>
                                  <select
                                    value={finCategory}
                                    onChange={(e) => setFinCategory(e.target.value)}
                                    className="w-full px-3 py-2 bg-neutral-50 rounded-lg border border-rose-100 text-xs focus:outline-none"
                                  >
                                    <option value="Suprimentos">Suprimentos / Insumos</option>
                                    <option value="Alongamento Gel">Lançamento Gel (Receita)</option>
                                    <option value="Esmaltação Gel">Lançamento Esmaltação (Receita)</option>
                                    <option value="Aluguel Sala">Sala / Infraestrutura</option>
                                    <option value="Marketing">Marketing / Brindes</option>
                                    <option value="Manutenção">Manutenção de Cabine/Motores</option>
                                    <option value="Outros">Outras Despesas</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="text-[10px] uppercase font-bold text-neutral-500 block mb-1">Data *</label>
                                  <input
                                    type="date"
                                    required
                                    value={finDate}
                                    onChange={(e) => setFinDate(e.target.value)}
                                    className="w-full px-3 py-2 bg-neutral-50 rounded-lg border border-rose-100 text-xs focus:outline-none"
                                  />
                                </div>

                                <div>
                                  <label className="text-[10px] uppercase font-bold text-neutral-500 block mb-1">Descrição Informativa</label>
                                  <input
                                    type="text"
                                    value={finDescription}
                                    onChange={(e) => setFinDescription(e.target.value)}
                                    placeholder="Ex: Compra de 4 géis autonivelantes Rose"
                                    className="w-full px-3 py-2 bg-neutral-50 rounded-lg border border-rose-100 text-xs focus:outline-none"
                                  />
                                </div>

                                <button
                                  type="submit"
                                  className="w-full py-2 bg-neutral-800 text-white hover:bg-neutral-900 font-bold uppercase text-[10px] tracking-wider rounded-lg border-none mt-2 transition-all shadow-3xs cursor-pointer"
                                >
                                  Adicionar Lançamento
                                </button>
                              </form>
                            </div>
                          </div>

                          {/* Ledger transactions list */}
                          <div className="lg:col-span-2 bg-white rounded-2xl border border-rose-100/60 overflow-hidden shadow-3xs flex flex-col justify-between">
                            <div>
                              <div className="p-5 border-b border-rose-100 flex items-center justify-between">
                                <h4 className="font-serif text-sm font-bold text-neutral-90 font-serif">Extrato Completo de Contas</h4>
                                <span className="text-[11px] text-neutral-400">Exibindo registros em ordem cronológica</span>
                              </div>
                              
                              <div className="divide-y divide-rose-50 text-xs text-neutral-700 max-h-[440px] overflow-y-auto">
                                {finance.slice().reverse().map(entry => (
                                  <div key={entry.id} className="p-4 hover:bg-rose-50/5 flex items-center justify-between gap-4">
                                    <div className="space-y-1">
                                      <div className="flex items-center space-x-2">
                                        <p className="font-semibold text-neutral-900">{entry.description}</p>
                                        {entry.isRawMaterial && (
                                          <span className="bg-rose-100 text-rose-800 text-[9px] uppercase font-bold px-1.5 py-0.5 rounded flex items-center space-x-0.5 shrink-0 select-none">
                                            <Package className="w-2.5 h-2.5" />
                                            <span>Insumo</span>
                                          </span>
                                        )}
                                        {entry.isRecurring && (
                                          <span className="bg-indigo-100 text-indigo-800 text-[9px] uppercase font-bold px-1.5 py-0.5 rounded flex items-center space-x-0.5 shrink-0 select-none">
                                            <Repeat className="w-2.5 h-2.5" />
                                            <span>Recorrente</span>
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex items-center space-x-2 text-[10px] text-neutral-400 font-sans">
                                        <span className="font-medium bg-rose-50 px-2 py-0.5 rounded text-rose-700 border border-rose-100">{entry.category}</span>
                                        <span>•</span>
                                        <span>{entry.date.split('-').reverse().join('/')}</span>
                                      </div>
                                    </div>

                                    <div className="flex items-center space-x-3 shrink-0 select-none">
                                      <span className={`font-serif font-extrabold text-sm ${
                                        entry.type === 'income' ? 'text-emerald-700' : 'text-red-500'
                                      }`}>
                                        {entry.type === 'income' ? '+' : '-'} R$ {entry.amount.toFixed(2).replace('.', ',')}
                                      </span>
                                      <button
                                        onClick={() => handleDeleteFinance(entry.id)}
                                        className="p-1.5 text-neutral-350 hover:text-red-500 hover:bg-red-50 rounded-md transition-all cursor-pointer"
                                        title="Deletar Lançamento"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>
                    )}

                    {/* ======================= SUB-TAB: RAW MATERIALS ======================= */}
                    {financeSubTab === 'raw-materials' && (
                      <div className="space-y-6">
                        
                        {/* KPI Cards specific to Materials */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                          {/* Card 1: Total invested in raw supply */}
                          <div className="bg-white rounded-2xl p-5 border border-rose-100 shadow-3xs flex items-center space-x-4">
                            <div className="bg-rose-50 text-rose-600 p-3.5 rounded-xl shrink-0">
                              <Package className="w-6 h-6" />
                            </div>
                            <div>
                              <span className="text-[10px] tracking-wider uppercase text-neutral-400 font-bold block">Total em Matéria-Prima</span>
                              <span className="font-serif font-extrabold text-neutral-850 text-lg md:text-xl text-rose-600">
                                R$ {finance.filter(f => f.isRawMaterial).reduce((s, f) => s + f.amount, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          </div>

                          {/* Card 2: Estimated average raw material cost per service */}
                          <div className="bg-white rounded-2xl p-5 border border-rose-100 shadow-3xs flex items-center space-x-4">
                            <div className="bg-amber-50 text-amber-700 p-3.5 rounded-xl shrink-0">
                              <Layers className="w-6 h-6" />
                            </div>
                            <div>
                              <span className="text-[10px] tracking-wider uppercase text-neutral-400 font-bold block">CMV Est. por Atendimento</span>
                              <span className="font-serif font-extrabold text-neutral-850 text-lg md:text-xl">
                                R$ {(() => {
                                  const listObj = finance.filter(f => f.isRawMaterial);
                                  const sumCost = listObj.reduce((s, r) => s + r.amount, 0);
                                  const totalAtendimentos = listObj.reduce((s, r) => {
                                    const match = r.description.match(/Rendimento:\s*(\d+)/);
                                    const rend = match ? parseInt(match[1], 10) : 15;
                                    return s + ((r.qty || 1) * rend);
                                  }, 0);
                                  return totalAtendimentos > 0 ? (sumCost / totalAtendimentos) : 4.50;
                                })().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          </div>

                          {/* Card 3: Total orders / batches */}
                          <div className="bg-white rounded-2xl p-5 border border-rose-100 shadow-3xs flex items-center space-x-4">
                            <div className="bg-indigo-50 text-indigo-700 p-3.5 rounded-xl shrink-0">
                              <Clock className="w-6 h-6" />
                            </div>
                            <div>
                              <span className="text-[10px] tracking-wider uppercase text-neutral-400 font-bold block">Lotes de Insumos Comprados</span>
                              <span className="font-serif font-extrabold text-neutral-850 text-lg md:text-xl">
                                {finance.filter(f => f.isRawMaterial).length} Registros
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Interactive columns: registry & current supply ledger */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          
                          {/* Left: registry form */}
                          <div className="bg-white rounded-2xl border border-rose-100 p-5 shadow-3xs">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-4 font-serif flex items-center space-x-1">
                              <Plus className="w-4 h-4 text-rose-500" />
                              <span>Lançar Compra de Matéria-Prima</span>
                            </h4>
                            <p className="text-[11px] text-neutral-400 mb-4 leading-relaxed font-sans">
                              Registre compras de monomer, acrílico, géis, tips, brocas ou lixas. O sistema recalcula automaticamente o custo proporcional por atendimento.
                            </p>
                            
                            <form onSubmit={handleAddRawMaterial} className="space-y-3.5">
                              <div>
                                <label className="text-[10px] uppercase font-bold text-neutral-500 block mb-1">Nome do Insumo *</label>
                                <input
                                  type="text"
                                  required
                                  value={rawMaterialName}
                                  onChange={(e) => setRawMaterialName(e.target.value)}
                                  placeholder="Ex: Monômero Líquido 240ml, Gel Master"
                                  className="w-full px-3 py-2 bg-neutral-50 rounded-lg border border-rose-100 text-xs focus:outline-none"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-3 font-sans">
                                <div>
                                  <label className="text-[10px] uppercase font-bold text-neutral-500 block mb-1">Custo Total Pago *</label>
                                  <input
                                    type="number"
                                    required
                                    value={rawMaterialPrice}
                                    onChange={(e) => setRawMaterialPrice(e.target.value)}
                                    placeholder="R$ 150,00"
                                    className="w-full px-3 py-2 bg-neutral-50 rounded-lg border border-rose-100 text-xs focus:outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] uppercase font-bold text-neutral-500 block mb-1">Quantidade *</label>
                                  <input
                                    type="number"
                                    required
                                    value={rawMaterialQty}
                                    onChange={(e) => setRawMaterialQty(e.target.value)}
                                    placeholder="Ex: 2"
                                    className="w-full px-3 py-2 bg-neutral-50 rounded-lg border border-rose-100 text-xs focus:outline-none"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3 font-sans font-medium">
                                <div>
                                  <label className="text-[10px] uppercase font-bold text-neutral-500 block mb-1">Grupo de Suprimentos</label>
                                  <select
                                    value={rawMaterialCategory}
                                    onChange={(e) => setRawMaterialCategory(e.target.value)}
                                    className="w-full px-3 py-2 bg-neutral-50 rounded-lg border border-rose-100 text-xs focus:outline-none"
                                  >
                                    <option value="Suprimentos">Géis & Acrilico</option>
                                    <option value="Suprimentos">Líquidos & Preparadores</option>
                                    <option value="Suprimentos">Brocas & Lixas</option>
                                    <option value="Suprimentos">Descartáveis/Moldes</option>
                                    <option value="Suprimentos">Outros</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="text-[10px] uppercase font-bold text-neutral-500 block mb-1">Atendimentos por Unidade</label>
                                  <select
                                    value={rawMaterialRentability}
                                    onChange={(e) => setRawMaterialRentability(e.target.value)}
                                    className="w-full px-3 py-2 bg-neutral-50 rounded-lg border border-rose-100 text-xs focus:outline-none"
                                  >
                                    <option value="10">~10 clientes</option>
                                    <option value="15">~15 clientes</option>
                                    <option value="25">~25 clientes</option>
                                    <option value="50">~50 clientes</option>
                                    <option value="100">~100 clientes</option>
                                  </select>
                                </div>
                              </div>

                              <div>
                                <label className="text-[10px] uppercase font-bold text-neutral-500 block mb-1">Data da Compra *</label>
                                <input
                                  type="date"
                                  required
                                  value={rawMaterialDate}
                                  onChange={(e) => setRawMaterialDate(e.target.value)}
                                  className="w-full px-3 py-2 bg-neutral-50 rounded-lg border border-rose-100 text-xs focus:outline-none"
                                />
                              </div>

                              <button
                                type="submit"
                                className="w-full py-2.5 bg-neutral-800 text-white hover:bg-neutral-900 font-bold uppercase text-[10px] tracking-wider rounded-lg border-none mt-2 transition-all shadow-3xs cursor-pointer flex items-center justify-center space-x-1.5"
                              >
                                <Package className="w-3.5 h-3.5 text-rose-300" />
                                <span>Cadastrar Insumo</span>
                              </button>
                            </form>
                          </div>

                          {/* Right: supplies ledger */}
                          <div className="lg:col-span-2 bg-white rounded-2xl border border-rose-100/60 overflow-hidden shadow-3xs flex flex-col justify-between">
                            <div>
                              <div className="p-5 border-b border-rose-100 flex items-center justify-between">
                                <h4 className="font-serif text-sm font-bold text-neutral-90">Insumos Registrados & Custo Proporcional</h4>
                                <span className="text-[10px] bg-neutral-100 px-2.5 py-0.5 rounded text-neutral-500 font-bold select-none font-sans">Estoque Ativo</span>
                              </div>

                              <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs text-neutral-700 divide-y divide-rose-50 select-none">
                                  <thead className="bg-rose-50/20 text-[10px] uppercase tracking-wider font-bold text-neutral-400 font-sans">
                                    <tr>
                                      <th className="p-4">Insumo</th>
                                      <th className="p-4">Qtd</th>
                                      <th className="p-4">Custo Un.</th>
                                      <th className="p-4">Proporção /u</th>
                                      <th className="p-4">Custo/Atend.</th>
                                      <th className="p-2 text-right">Total</th>
                                      <th className="p-4 text-center">Ação</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-rose-50 font-sans">
                                    {finance.filter(f => f.isRawMaterial).length === 0 ? (
                                      <tr>
                                        <td colSpan={7} className="p-8 text-center text-neutral-400">
                                          <Package className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                                          <p className="font-serif font-bold text-neutral-700">Nenhuma matéria-prima declarada no extrato.</p>
                                          <p className="text-[10px] mt-1 text-center max-w-xs mx-auto">Adicione lixas, géis ou outros materiais no menu ao lado para listar aqui.</p>
                                        </td>
                                      </tr>
                                    ) : (
                                      finance.filter(f => f.isRawMaterial).slice().reverse().map(item => {
                                        const rawName = item.description.replace(/^Matéria-prima:\s*/, '').split(' (Qtd:')[0];
                                        const uPrice = item.unitPrice || (item.amount / (item.qty || 1));
                                        const rendMatch = item.description.match(/Rendimento:\s*(\d+)/);
                                        const rendVal = rendMatch ? parseInt(rendMatch[1], 10) : 15;
                                        const costPerApt = uPrice / rendVal;

                                        return (
                                          <tr key={item.id} className="hover:bg-rose-50/5 text-xs">
                                            <td className="p-4 font-sans">
                                              <div className="font-semibold text-neutral-900">{rawName}</div>
                                              <div className="text-[9px] text-neutral-400">{item.date.split('-').reverse().join('/')}</div>
                                            </td>
                                            <td className="p-4 font-mono text-neutral-600">{item.qty || 1} u</td>
                                            <td className="p-4 whitespace-nowrap">R$ {uPrice.toFixed(2)}</td>
                                            <td className="p-4 text-neutral-500 text-xs">
                                              👥 {rendVal} atend.
                                            </td>
                                            <td className="p-4 whitespace-nowrap">
                                              <span className="bg-rose-50 px-2 py-0.5 rounded text-rose-800 font-extrabold font-serif text-[11px] border border-rose-100">
                                                R$ {costPerApt.toFixed(2)}
                                              </span>
                                            </td>
                                            <td className="p-2 text-right font-serif font-bold whitespace-nowrap text-rose-600">
                                              R$ {item.amount.toFixed(2)}
                                            </td>
                                            <td className="p-4 text-center">
                                              <button
                                                onClick={() => handleDeleteFinance(item.id)}
                                                className="p-1 text-neutral-350 hover:text-red-500 hover:bg-red-50 rounded"
                                                title="Excluir Entrada"
                                              >
                                                <X className="w-4 h-4" />
                                              </button>
                                            </td>
                                          </tr>
                                        );
                                      })
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>
                    )}

                    {/* ======================= SUB-TAB: RECURRING EXPENSES ======================= */}
                    {financeSubTab === 'recurring' && (
                      <div className="space-y-6">
                        
                        {/* KPI Cards specific to Recurrence */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                          {/* Card 1: Predicted Scheduled Monthly Total */}
                          <div className="bg-white rounded-2xl p-5 border border-rose-100 shadow-3xs flex items-center space-x-4">
                            <div className="bg-indigo-50 text-indigo-700 p-3.5 rounded-xl shrink-0">
                              <Repeat className="w-6 h-6" />
                            </div>
                            <div>
                              <span className="text-[10px] tracking-wider uppercase text-neutral-400 font-bold block">Previsão Custos Fixos</span>
                              <span className="font-serif font-extrabold text-indigo-700 text-lg md:text-xl">
                                R$ {recurringTemplates.reduce((sum, r) => sum + r.amount, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          </div>

                          {/* Card 2: Total paid so far in the current month */}
                          <div className="bg-white rounded-2xl p-5 border border-rose-100 shadow-3xs flex items-center space-x-4">
                            <div className="bg-[#15803d]/10 text-[#15803d] p-3.5 rounded-xl shrink-0">
                              <CheckCircle className="w-6 h-6" />
                            </div>
                            <div>
                              <span className="text-[10px] tracking-wider uppercase text-neutral-400 font-bold block">Contas Pagas (Mês Atual)</span>
                              <span className="font-serif font-extrabold text-[#15803d] text-lg md:text-xl">
                                R$ {(() => {
                                  const cKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
                                  return finance
                                    .filter(f => f.isRecurring && f.date.startsWith(cKey))
                                    .reduce((sum, f) => sum + f.amount, 0);
                                })().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          </div>

                          {/* Card 3: Pending fixed expenses */}
                          <div className="bg-white rounded-2xl p-5 border border-rose-100 shadow-3xs flex items-center space-x-4">
                            <div className="bg-amber-50 text-amber-700 p-3.5 rounded-xl shrink-0">
                              <Info className="w-6 h-6" />
                            </div>
                            <div>
                              <span className="text-[10px] tracking-wider uppercase text-neutral-400 font-bold block">Contas Pendentes / Mês</span>
                              <span className="font-serif font-extrabold text-amber-700 text-lg md:text-xl">
                                R$ {(() => {
                                  const sch = recurringTemplates.reduce((sum, r) => sum + r.amount, 0);
                                  const cKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
                                  const paid = finance
                                    .filter(f => f.isRecurring && f.date.startsWith(cKey))
                                    .reduce((sum, f) => sum + f.amount, 0);
                                  return Math.max(0, sch - paid);
                                })().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Layout grid columns */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          
                          {/* Register customized recurring patterns */}
                          <div className="bg-white rounded-2xl border border-rose-100 p-5 shadow-3xs">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-4 font-serif flex items-center space-x-1.5">
                              <Plus className="w-4 h-4 text-indigo-500" />
                              <span>Modelo de Conta Recorrente</span>
                            </h4>
                            <p className="text-[11px] text-neutral-400 mb-4 leading-relaxed font-sans">
                              Crie um modelo para contas recorrentes do estúdio (ex: aluguel, luz, taxas). Uma vez salvo, você conseguirá lançá-lo no extrato de contas com um único clique de confirmação todos os meses!
                            </p>

                            <form onSubmit={handleAddRecurringTemplate} className="space-y-3.5">
                              <div>
                                <label className="text-[10px] uppercase font-bold text-neutral-500 block mb-1">Nome da Despesa *</label>
                                <input
                                  type="text"
                                  required
                                  value={recurringName}
                                  onChange={(e) => setRecurringName(e.target.value)}
                                  placeholder="Ex: Conta de Luz, Aluguel Loja"
                                  className="w-full px-3 py-2 bg-neutral-50 rounded-lg border border-rose-100 text-xs focus:outline-none"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-3 font-sans">
                                <div>
                                  <label className="text-[10px] uppercase font-bold text-neutral-500 block mb-1">Valor Previsto (R$) *</label>
                                  <input
                                    type="number"
                                    required
                                    value={recurringAmount}
                                    onChange={(e) => setRecurringAmount(e.target.value)}
                                    placeholder="R$ 150"
                                    className="w-full px-3 py-2 bg-neutral-50 rounded-lg border border-rose-100 text-xs focus:outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] uppercase font-bold text-neutral-500 block mb-1">Dia do Vencimento *</label>
                                  <input
                                    type="number"
                                    required
                                    min="1"
                                    max="31"
                                    value={recurringDueDate}
                                    onChange={(e) => setRecurringDueDate(e.target.value)}
                                    placeholder="Ex: 5"
                                    className="w-full px-3 py-2 bg-neutral-50 rounded-lg border border-rose-100 text-xs focus:outline-none"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3 font-sans font-medium">
                                <div>
                                  <label className="text-[10px] uppercase font-bold text-neutral-500 block mb-1">Frequência</label>
                                  <select
                                    value={recurringInterval}
                                    onChange={(e) => setRecurringInterval(e.target.value as any)}
                                    className="w-full px-3 py-2 bg-neutral-50 rounded-lg border border-rose-100 text-xs focus:outline-none"
                                  >
                                    <option value="monthly">Mensal</option>
                                    <option value="weekly">Semanal</option>
                                    <option value="yearly">Anual</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="text-[10px] uppercase font-bold text-neutral-500 block mb-1">Grupo de Custos</label>
                                  <select
                                    value={recurringCategory}
                                    onChange={(e) => setRecurringCategory(e.target.value)}
                                    className="w-full px-3 py-2 bg-neutral-50 rounded-lg border border-rose-100 text-xs focus:outline-none"
                                  >
                                    <option value="Aluguel Sala">Aluguel / Sala</option>
                                    <option value="Luz/Água">Infraestrutura (Luz/Água)</option>
                                    <option value="Assinatura">Assinaturas Software</option>
                                    <option value="Marketing">Marketing / Tráfego</option>
                                    <option value="Outros">Outras Despesas</option>
                                  </select>
                                </div>
                              </div>

                              <button
                                type="submit"
                                className="w-full py-2.5 bg-neutral-800 text-white hover:bg-neutral-900 font-bold uppercase text-[10px] tracking-wider rounded-lg border-none mt-2 transition-all shadow-3xs cursor-pointer flex items-center justify-center space-x-1.5"
                              >
                                <Repeat className="w-3.5 h-3.5 text-indigo-300" />
                                <span>Cadastrar Modelo</span>
                              </button>
                            </form>
                          </div>

                          {/* Interactive list of accounts & payment triggers */}
                          <div className="lg:col-span-2 bg-white rounded-2xl border border-rose-100/60 overflow-hidden shadow-3xs">
                            <div className="p-5 border-b border-rose-100 flex items-center justify-between">
                              <h4 className="font-serif text-sm font-bold text-neutral-90">Despesas Recorrentes Mapeadas</h4>
                              <span className="text-[11px] text-neutral-400">Controle do mês atual</span>
                            </div>

                            <div className="p-4 space-y-4 font-sans">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {recurringTemplates.map(template => {
                                  const cKeyMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
                                  
                                  // Find if been paid (matches Gasto Recorrente: template.name in description)
                                  const isPaidThisMonth = finance.some(f => 
                                    f.isRecurring && 
                                    f.description.includes(template.name) && 
                                    f.date.startsWith(cKeyMonth)
                                  );

                                  return (
                                    <div 
                                      key={template.id} 
                                      className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition-colors ${
                                        isPaidThisMonth 
                                          ? 'bg-emerald-50/20 border-emerald-100/80' 
                                          : 'bg-white border-rose-100/65 hover:border-rose-200'
                                      }`}
                                    >
                                      <div className="flex items-start justify-between">
                                        <div>
                                          <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-100">
                                            {template.category}
                                          </span>
                                          <h5 className="font-serif font-extrabold text-neutral-850 text-sm mt-1">{template.name}</h5>
                                          <p className="text-[10px] text-neutral-400 font-medium font-mono">Vence todo dia {template.dueDate}</p>
                                        </div>

                                        <button
                                          onClick={() => handleDeleteRecurringTemplate(template.id)}
                                          className="p-1 text-neutral-350 hover:text-red-500 hover:bg-red-50 rounded transition-all cursor-pointer"
                                          title="Remover Modelo"
                                        >
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      </div>

                                      <div className="flex items-center justify-between pt-1 border-t border-rose-50/60 font-sans">
                                        <span className="font-serif font-extrabold text-neutral-800 text-sm whitespace-nowrap">
                                          R$ {template.amount.toFixed(2).replace('.', ',')}
                                        </span>

                                        {isPaidThisMonth ? (
                                          <span className="bg-[#15803d]/10 text-[#15803d] text-[10px] font-bold py-1 px-3.5 rounded-full flex items-center space-x-1 border border-emerald-100/50">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                                            <span>✓ Liquidado</span>
                                          </span>
                                        ) : (
                                          <button
                                            onClick={() => handlePayRecurringExpense(template)}
                                            className="px-3 py-1.5 bg-[#4f46e5] hover:bg-[#4338ca] text-white font-extrabold text-[10px] tracking-wider rounded-lg border-none transition-all cursor-pointer shadow-3xs flex items-center space-x-1"
                                          >
                                            <CheckCircle className="w-3" />
                                            <span>Pagar / Lançar</span>
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Historical recursive list */}
                              <div className="mt-6 font-sans">
                                <h5 className="text-[10px] uppercase tracking-wider font-bold text-neutral-400 mb-3 select-none">
                                  Histórico de Recorrências Liquidadas (Mês Corrente)
                                </h5>

                                <div className="divide-y divide-rose-50 border border-rose-100/55 rounded-xl overflow-hidden text-xs text-neutral-700 bg-neutral-50/30 font-sans">
                                  {finance.filter(f => f.isRecurring).slice().reverse().map(elem => (
                                    <div key={elem.id} className="p-3 flex items-center justify-between hover:bg-rose-50/5 text-xs text-neutral-700">
                                      <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                        <div>
                                          <p className="font-semibold text-neutral-850">{elem.description}</p>
                                          <p className="text-[9px] text-neutral-400">{elem.date.split('-').reverse().join('/')}</p>
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-2 select-none">
                                        <span className="font-serif font-extrabold text-red-500">
                                          - R$ {elem.amount.toFixed(2).replace('.', ',')}
                                        </span>
                                        <button
                                          onClick={() => handleDeleteFinance(elem.id)}
                                          className="p-1 text-neutral-300 hover:text-red-500 cursor-pointer"
                                        >
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}

                                  {finance.filter(f => f.isRecurring).length === 0 && (
                                    <p className="p-4 text-center text-[11px] text-neutral-400 italic">Nenhum gasto recorrente liquidado ainda no extrato financeiro.</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>
                    )}

                  </div>
                )}

                {/* TAB CONTENT: 4. AUTOMACAO DE LEMBRETES COM INTELIGENCIA ARTIFICIAL (GEMINI) */}
                {adminTab === 'reminders' && (
                  <div className="space-y-6">
                    
                    <div className="bg-gradient-to-r from-rose-50 to-neutral-50 p-6 rounded-2xl border border-rose-100 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                      <div className="md:col-span-2 space-y-2">
                        <div className="inline-flex items-center space-x-1.5 bg-rose-200/50 text-rose-800 px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Automação Gemini 3.5-Flash</span>
                        </div>
                        <h4 className="font-serif text-lg font-bold text-neutral-8DD">Secretária de Atendimento I.A.</h4>
                        <p className="text-neutral-500 text-xs leading-relaxed">
                          Nosso sistema estuda o nome, horário e o procedimento específico da cliente e utiliza o modelo de linguagem do Google para gerar uma mensagem personalizada e calorosa para o WhatsApp, aumentando a taxa de confirmação em até 85%.
                        </p>
                      </div>

                      <div className="bg-white p-4 rounded-xl border border-rose-100 shadow-3xs flex flex-col justify-center items-center">
                        <MessageSquare className="w-7 h-7 text-rose-500 mb-2" />
                        <span className="text-[10px] font-bold text-neutral-400 uppercase">Mensagens Enviadas</span>
                        <span className="font-serif text-2xl font-bold text-rose-700 mt-1">{reminders.length}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* Left Side: Pending schedule reminders lists */}
                      <div className="lg:col-span-2 space-y-3.5">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                          Selecione o agendamento ativo para notificar
                        </h4>

                        <div className="grid grid-cols-1 gap-2.5">
                          {appointments.filter(a => a.status === 'pending').map(apt => {
                            // check if already has reminder logged
                            const isReminderSent = reminders.some(r => r.appointmentId === apt.id);
                            
                            return (
                              <div 
                                key={apt.id}
                                className={`p-4 bg-white rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3.5 transition-all ${
                                  selectedAptForReminder?.id === apt.id 
                                    ? 'border-rose-600 bg-rose-50/10' 
                                    : 'border-rose-100'
                                }`}
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center space-x-2">
                                    <p className="font-semibold text-neutral-850 text-xs">{apt.clientName}</p>
                                    {isReminderSent && (
                                      <span className="bg-emerald-50 text-emerald-800 font-bold px-1.5 py-0.5 rounded text-[8px] uppercase border border-emerald-200">Enviado</span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-neutral-500 font-medium">Procedimento: {apt.procedureName} (com {apt.professionalName || "Isabel Santos"}) • {apt.time}h</p>
                                  <p className="text-[10px] text-neutral-400">Data: {apt.date.split('-').reverse().join('/')}</p>
                                </div>

                                <button
                                  id={`btn_ai_reminder_${apt.id}`}
                                  onClick={() => handleGenerateAIReminder(apt)}
                                  className="px-4 py-2 bg-rose-600 text-white hover:bg-rose-705 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all shadow-3xs flex items-center space-x-1.5"
                                >
                                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                                  <span>Redigir com I.A.</span>
                                </button>
                              </div>
                            );
                          })}

                          {appointments.filter(a => a.status === 'pending').length === 0 && (
                            <p className="text-normal text-neutral-400 italic bg-white rounded-xl border p-8 text-center border-dashed">Nenhum atendimento pendente na agenda para gerar lembretes.</p>
                          )}
                        </div>
                      </div>

                      {/* Right Side: Preview box & simulated whatsapp window trigger */}
                      <div>
                        {selectedAptForReminder ? (
                          <div className="bg-white rounded-2xl border border-rose-250/60 p-5 sticky top-24 shadow-3xs space-y-4">
                            <div className="flex items-center justify-between border-b border-rose-100 pb-3">
                              <span className="text-[10px] font-extrabold uppercase text-rose-600 tracking-wider">Lembrete Inteligente</span>
                              <button 
                                onClick={() => { setSelectedAptForReminder(null); setGeneratedReminderText(''); }}
                                className="text-neutral-400 hover:text-neutral-600 p-1"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="space-y-1">
                              <p className="text-[10px] font-bold text-neutral-400 uppercase">Cliente Alvo</p>
                              <h5 className="font-serif font-bold text-[#2E1E1C]">{selectedAptForReminder.clientName}</h5>
                              <p className="text-[10px] text-neutral-500">{selectedAptForReminder.clientPhone}</p>
                            </div>

                            {/* Generative loading message */}
                            {generatingReminder && (
                              <div className="bg-neutral-50 rounded-xl p-5 border text-center space-y-2.5">
                                <div className="w-6 h-6 border-2 border-t-rose-600 border-rose-150 rounded-full animate-spin mx-auto"></div>
                                <p className="text-[10px] text-neutral-500 font-medium">Gemini redigindo convite personalizado...</p>
                              </div>
                            )}

                            {/* Generated text preview field */}
                            {!generatingReminder && generatedReminderText && (
                              <div className="space-y-3">
                                <div className="flex items-center justify-between text-[11px] text-neutral-500">
                                  <span>Texto da Mensagem:</span>
                                  <button
                                    onClick={() => handleCopyToClipboard(generatedReminderText)}
                                    className="flex items-center space-x-1 font-bold text-[10px] text-rose-600 hover:underline"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>{copiedNotification ? "Copiado!" : "Copiar"}</span>
                                  </button>
                                </div>
                                <textarea
                                  value={generatedReminderText}
                                  onChange={(e) => setGeneratedReminderText(e.target.value)}
                                  className="w-full text-xs p-4 bg-[#EDF7F1]/40 border border-green-200/80 rounded-xl text-neutral-800 leading-relaxed font-sans focus:outline-none"
                                  rows={12}
                                />
                                
                                <button
                                  id="btn_send_whatsapp_real"
                                  onClick={handleConfirmSendReminder}
                                  className="w-full py-3 bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-xs border-none font-bold uppercase tracking-wider text-xs rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-3xs"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                  <span>Enviar via WhatsApp</span>
                                </button>
                                <p className="text-[9px] text-neutral-400 text-center">
                                  * Ao clicar, abriremos o WhatsApp Web/App preenchido e atualizaremos o histórico da cliente!
                                </p>
                              </div>
                            )}

                          </div>
                        ) : (
                          <div className="bg-rose-50/20 rounded-2xl border border-dashed border-rose-100 p-8 text-center text-neutral-400 sticky top-24">
                            <Sparkles className="w-8 h-8 text-rose-350 mx-auto mb-2" />
                            <h5 className="font-bold text-xs text-neutral-700">Previsão do Lembrete</h5>
                            <p className="text-[10px] mt-1 text-center max-w-xs mx-auto">Escolha o agendamento à esquerda e clique em "Redigir com I.A." para obter seu texto personalizado.</p>
                          </div>
                        )}
                      </div>

                    </div>

                    {/* Historical message logs */}
                    {reminders.length > 0 && (
                      <div className="bg-white rounded-2xl border border-rose-100/60 shadow-3xs overflow-hidden">
                        <div className="p-4 border-b border-rose-100 bg-rose-50/40">
                          <h5 className="font-serif font-bold text-xs text-neutral-9CD">Lembretes Disparados Recentemente</h5>
                        </div>
                        <div className="divide-y divide-rose-50 text-xs">
                          {reminders.slice().reverse().map(log => (
                            <div key={log.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-neutral-600">
                              <div className="space-y-1">
                                <p className="font-bold text-neutral-900">{log.clientName}</p>
                                <p className="text-[10px] text-neutral-500 font-medium">Notificada no número {log.phone} • status: <span className="text-emerald-700 font-bold">Transmitido</span></p>
                              </div>
                              <p className="text-[11px] text-neutral-400 md:text-right font-medium">Disparado em: {log.sentAt}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                )}

                {/* TAB CONTENT: 5. SUPABASE CLOUD DATABASE DEPLOY */}
                {adminTab === 'supabase' && (
                  <div className="space-y-6 animate-fade-in text-neutral-800">
                    
                    {/* Header Banner */}
                    <div className="bg-neutral-900 p-6 rounded-2xl border border-neutral-800 grid grid-cols-1 md:grid-cols-3 gap-6 items-center text-white">
                      <div className="md:col-span-2 space-y-2">
                        <div className="inline-flex items-center space-x-1.5 bg-[#3ecf8e]/10 text-[#3ecf8e] px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border border-[#3ecf8e]/20">
                          <Database className="w-3.5 h-3.5" />
                          <span>Infraestrutura Supabase Ativa</span>
                        </div>
                        <h4 className="font-serif text-lg font-bold text-white">Banco de Dados em Nuvem (Supabase)</h4>
                        <p className="text-neutral-400 text-xs leading-relaxed">
                          Conecte o sistema profissional da Isabel Santos a um servidor de banco de dados robusto PostgreSQL hospedado em nuvem pelo Supabase. Isso garante segurança total e sincronização em tempo real de clientes, finanças e agendamentos entre seus múltiplos dispositivos.
                        </p>
                      </div>

                      <div className="bg-neutral-800/60 p-4 rounded-xl border border-neutral-700/50 flex flex-col justify-center items-center text-center">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase">Modo de Persistência</span>
                        <div className="flex items-center space-x-1.5 mt-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${
                            dbStatus?.status === 'supabase_active' ? 'bg-[#3ecf8e] animate-pulse' : 'bg-amber-500'
                          }`}></span>
                          <span className="font-sans font-bold text-xs uppercase tracking-wide">
                            {dbStatus?.status === 'supabase_active' ? 'Cloud Supabase' : 'Arquivo JSON Local'}
                          </span>
                        </div>
                        <p className="text-[10px] text-neutral-450 mt-1.5 leading-tight">
                          {dbStatus?.status === 'supabase_active' 
                            ? 'Dados seguros e persistidos na nuvem.' 
                            : 'Usando database.json enquanto configura.'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      
                      {/* Left Side: Status, variables Guide, and Seeding */}
                      <div className="space-y-6">
                        
                        {/* Status Card */}
                        <div className="bg-white p-6 rounded-2xl border border-rose-100/65 shadow-3xs space-y-4">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center space-x-1.5">
                            <Shield className="w-4 h-4 text-neutral-400" />
                            <span>Status da Conexão Dinâmica</span>
                          </h4>

                          {dbStatus?.status === 'supabase_active' && (
                            <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-150 rounded-xl space-y-2">
                              <div className="flex items-center space-x-2 font-bold text-xs">
                                <CheckCircle className="w-4 h-4 text-emerald-600" />
                                <span>Conexão Pronta e Operando!</span>
                              </div>
                              <p className="text-[11px] leading-relaxed text-emerald-700">
                                O Express identificou as credenciais e as tabelas corretas. As leituras e gravações estão ocorrendo live diretamente na nuvem no seu projeto Supabase.
                              </p>
                            </div>
                          )}

                          {dbStatus?.status === 'supabase_error' && (
                            <div className="p-4 bg-red-50 text-red-850 border border-red-150 rounded-xl space-y-2">
                              <div className="flex items-center space-x-2 font-bold text-xs">
                                <AlertCircle className="w-4 h-4 text-red-650" />
                                <span>Verifique as Tabelas do Banco</span>
                              </div>
                              <p className="text-[11px] leading-relaxed text-red-750">
                                {dbStatus.message}
                              </p>
                              <div className="text-[10px] bg-red-100/50 p-2 rounded text-red-800 font-mono">
                                Dica: Copie o script SQL ao lado e execute-o clicando em "+ New Query" no menu SQL Editor do Supabase para criar as tabelas!
                              </div>
                            </div>
                          )}

                          {dbStatus?.status === 'local' && (
                            <div className="p-4 bg-amber-50 text-amber-850 border border-amber-150 rounded-xl space-y-2">
                              <div className="flex items-center space-x-2 font-bold text-xs">
                                <Info className="w-4 h-4 text-amber-655" />
                                <span>Configurando Credenciais de Acesso</span>
                              </div>
                              <p className="text-[11px] leading-relaxed text-amber-750">
                                Para conectar e ativar o banco de dados em nuvem, você precisa adicionar as seguintes chaves no painel **Secrets** ou arquivo .env da sua aplicação:
                              </p>
                              <ul className="list-disc list-inside text-[10px] space-y-1 pl-1 font-mono text-amber-850">
                                <li>Key: <span className="font-bold">SUPABASE_URL</span></li>
                                <li>Key: <span className="font-bold">SUPABASE_ANON_KEY</span></li>
                              </ul>
                              <p className="text-[10px] text-amber-800/80 italic mt-1 leading-normal">
                                O sistema possui um backup dinâmico integrado, ou seja, enquanto você não inserir as chaves acima, o site continua funcionando normalmente via banco local sem nenhuma quebra de fluxo!
                              </p>
                            </div>
                          )}

                          {/* Seeding Box */}
                          {(!dbStatus?.supabaseConfigured || dbStatus?.tablesCreated) && (
                            <div className="border border-rose-100 p-4 rounded-xl font-sans space-y-3 bg-[#FAFAFA]">
                              <h5 className="font-bold text-xs text-[#2E1E1C] flex items-center space-x-1">
                                <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                                <span>Populador de Dados de Demonstração</span>
                              </h5>
                              <p className="text-[11px] text-neutral-500 leading-normal">
                                Se seu banco de dados Supabase acabou de ser configurado com o script SQL e as tabelas estiverem vazias, clique no botão para semear automaticamente os dados padrões do salão.
                              </p>

                              {seedingSuccess && (
                                <div className="text-[11px] p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-150 rounded-lg">
                                  {seedingSuccess}
                                </div>
                              )}

                              {seedingError && (
                                <div className="text-[11px] p-2.5 bg-red-50 text-red-800 border border-red-150 rounded-lg">
                                  {seedingError}
                                </div>
                              )}

                              <button
                                onClick={handleSeedSupabase}
                                disabled={seedingLoading}
                                className="px-5 py-2.5 bg-[#2F1F1D] hover:bg-[#201513] text-white disabled:opacity-50 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all shadow-3xs cursor-pointer inline-flex items-center space-x-1.5"
                              >
                                {seedingLoading ? (
                                  <>
                                    <div className="w-3 h-3 border-2 border-t-white border-neutral-500 rounded-full animate-spin"></div>
                                    <span>Semeando dados...</span>
                                  </>
                                ) : (
                                  <>
                                    <Database className="w-3.5 h-3.5 text-[#3ecf8e]" />
                                    <span>Semear Banco Supabase</span>
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Integration Guide */}
                        <div className="bg-white p-6 rounded-2xl border border-rose-100/65 shadow-3xs space-y-3 font-sans">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                            Guia de Integração Passo a Passo
                          </h4>
                          <ol className="text-xs text-neutral-605 space-y-3 list-decimal list-inside leading-relaxed">
                            <li>Crie uma conta gratuita em <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="font-bold text-rose-600 hover:underline inline-flex items-center space-x-0.5"><span>Supabase.com</span><ExternalLink className="w-3 h-3" /></a> e crie um novo projeto.</li>
                            <li>No menu lateral esquerdo do Supabase, clique em **SQL Editor** &gt; **+ New Query**.</li>
                            <li>Copie todo o script SQL ao lado, cole no editor e clique em **Run** no canto inferior. Prontinho, as tabelas estarão criadas!</li>
                            <li>Acesse as configurações do projeto (**Project Settings** &gt; **API**) no Supabase e copie os valores de **Project URL** e **anon public API Key**.</li>
                            <li>Insira esses dois valores como segredos (Secrets) em seu console **Google AI Studio** e reinicie o servidor. Ativação instantânea!</li>
                          </ol>
                        </div>

                      </div>

                      {/* Right Side: SQL Editor */}
                      <div className="bg-white p-6 rounded-2xl border border-rose-100/65 shadow-3xs space-y-4 flex flex-col">
                        <div className="flex items-center justify-between border-b border-rose-50 pb-3">
                          <div className="space-y-1">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                              Gerador de Estrutura SQL
                            </h4>
                            <p className="text-[10px] text-neutral-400">Clique ao lado para copiar o script completo.</p>
                          </div>
                          
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(sqlScript);
                              setCopiarSqlNotificacao(true);
                              setTimeout(() => setCopiarSqlNotificacao(false), 2500);
                            }}
                            className="bg-neutral-100 hover:bg-neutral-200 text-neutral-750 px-3.5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center space-x-1.5"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>{copiarSqlNotificacao ? "Copiado!" : "Copiar SQL"}</span>
                          </button>
                        </div>

                        <div className="flex-1 bg-neutral-900 p-4 rounded-xl font-mono text-[10px] text-[#3ecf8e] overflow-auto leading-relaxed max-h-[500px]" style={{ whiteSpace: 'pre-wrap' }}>
                          {sqlScript}
                        </div>
                      </div>

                    </div>
                  </div>
                )}

              </div>
            )}
          </>
        )}
      </main>

      {/* ======================= MODAL PORTALS ======================= */}
      {/* 1. CRM: ADD CLIENT MODAL */}
      {showAddClientModal && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md border border-rose-100 shadow-2xl p-6 relative">
            <button 
              onClick={() => setShowAddClientModal(false)}
              className="absolute top-4 right-4 text-neutral-425 hover:text-neutral-600 p-1 rounded-full hover:bg-neutral-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif text-lg font-bold text-[#2E1E1C] mb-4">Adicionar Cliente ao CRM</h3>
            
            <form onSubmit={handleAddClient} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-neutral-500 block mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  id="input_new_crm_name"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="Nome de registro da cliente"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-neutral-500 block mb-1">WhatsApp / Telefone *</label>
                <input
                  type="tel"
                  required
                  id="input_new_crm_phone"
                  value={newClientPhone}
                  onChange={(e) => setNewClientPhone(e.target.value)}
                  placeholder="+55 (11) 99999-9999"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-neutral-500 block mb-1">E-mail (opcional)</label>
                <input
                  type="email"
                  value={newClientEmail}
                  onChange={(e) => setNewClientEmail(e.target.value)}
                  placeholder="cliente@exemplo.com"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-neutral-500 block mb-1">Data de Nascimento (opcional)</label>
                <input
                  type="date"
                  value={newClientBirthDate}
                  onChange={(e) => setNewClientBirthDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:bg-white text-neutral-800"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-neutral-500 block mb-1">Anotações iniciais / Cuidados</label>
                <textarea
                  value={newClientNotes}
                  onChange={(e) => setNewClientNotes(e.target.value)}
                  placeholder="Sua cliente possui alergias, formatos favoritos, cuidados específicos?"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:bg-white"
                  rows={3}
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddClientModal(false)}
                  className="px-4 py-2 border border-rose-100 text-neutral-600 text-xs font-bold uppercase rounded-xl hover:bg-neutral-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  id="btn_submit_new_client"
                  className="px-6 py-2 bg-neutral-800 text-white text-xs font-bold uppercase rounded-xl hover:bg-neutral-900"
                >
                  Salvar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-[#1A1110] text-[#DBCBC9]/80 py-12 border-t border-[#2F1F1D] text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <h5 className="font-serif text-white font-bold text-base uppercase tracking-wider">ISABEL SANTOS</h5>
            <p className="text-neutral-450 leading-relaxed max-w-sm">
              Especialista em Nails Premium, oferecendo acabamento natural com a mais requintada tecnologia de géis e Biossegurança.
            </p>
          </div>
          <div className="space-y-3">
            <h6 className="font-serif text-white font-bold uppercase tracking-wider">Funcionamento</h6>
            <p className="text-neutral-450">
              Terça a Sábado: 09h às 19h <br />
              Atendimento com hora marcada. Nova sala privativa e higienização hospitalar.
            </p>
          </div>
          <div className="space-y-2">
            <h6 className="font-serif text-white font-bold uppercase tracking-wider">Contato & Local</h6>
            <p className="text-neutral-450 flex items-center">
              <Phone className="w-4 h-4 mr-2 text-rose-450 shrink-0" /> 
              <a 
                href="https://wa.me/5567991733013" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:underline hover:text-white"
              >
                +55 (67) 99173-3013
              </a>
            </p>
            <p className="text-neutral-450 flex items-center">
              <Instagram className="w-4 h-4 mr-2 text-rose-450 shrink-0" /> 
              <a 
                href="https://www.instagram.com/isabelsantos.naildesigner/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:underline hover:text-white"
              >
                @isabelsantos.naildesigner
              </a>
            </p>
            <p className="text-neutral-450 leading-relaxed">
              Rua Tenente Antonio Joao Ribeiro, 1111 - Campo Grande, MS, CEP 79092-210
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-8 border-t border-[#2F1F1D] flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-550 gap-4">
          <p>© 2026 ISABEL SANTOS. Todos os direitos reservados.</p>
          <p>Feito para unhas mais fortes, brilhantes e autênticas.</p>
        </div>
      </footer>

    </div>
  );
}
