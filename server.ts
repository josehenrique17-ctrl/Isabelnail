/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), 'database.json');

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const isSupabaseEnabled = !!(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'MY_SUPABASE_URL' && 
  supabaseAnonKey !== 'MY_SUPABASE_ANON_KEY' &&
  supabaseUrl.trim() !== '' &&
  supabaseAnonKey.trim() !== ''
);

const supabase = isSupabaseEnabled 
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

if (isSupabaseEnabled) {
  console.log("Supabase Client initialized with URL:", supabaseUrl);
} else {
  console.log("Supabase not fully configured. Using database.json as primary fallback.");
}

app.use(express.json());

// In-Memory Database Structure with Mock Fallbacks
interface DatabaseSchema {
  catalog: any[];
  clients: any[];
  appointments: any[];
  finance: any[];
  reminders: any[];
}

const defaultDatabase: DatabaseSchema = {
  catalog: [
    {
      id: "cat_1",
      name: "Alongamento em acrílico",
      description: "Modelagem anatômica de acrílico esculpido que garante unhas longas, ultra resistentes, finas e com cutilagem técnica impecável inclusa.",
      price: 160.00,
      duration: 120,
      image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=800&auto=format&fit=crop",
      professional: "Isabel Santos"
    },
    {
      id: "cat_2",
      name: "Blindagem em acrílico",
      description: "Camada protetora ultra resistente desenvolvida em acrílico sobre a unha natural para proteger contra quebras e descamações.",
      price: 130.00,
      duration: 90,
      image: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?q=80&w=800&auto=format&fit=crop",
      professional: "Isabel Santos"
    },
    {
      id: "cat_3",
      name: "Esmaltação em Gel",
      description: "Aplicação de cores sofisticadas em gel com cura em cabine LED/UV. Secagem 100% imediata e brilho impecável de alta durabilidade.",
      price: 70.00,
      duration: 60,
      image: "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?q=80&w=800&auto=format&fit=crop",
      professional: "Samara"
    },
    {
      id: "cat_4",
      name: "Manicure",
      description: "Cutilagem técnica higiênica e detalhada das mãos combinada com esmaltação tradicional e hidratação das cutículas.",
      price: 35.00,
      duration: 40,
      image: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?q=80&w=800&auto=format&fit=crop",
      professional: "Samara"
    },
    {
      id: "cat_5",
      name: "Pedicure",
      description: "Tratamento completo dos pés com higienização, cutilagem precisa, esfoliação suave e hidratação restauradora de cutícula.",
      price: 45.00,
      duration: 45,
      image: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?q=80&w=800&auto=format&fit=crop",
      professional: "Samara"
    },
    {
      id: "cat_6",
      name: "Combo pé e mão",
      description: "O pacote completo essencial! Cuidado unificado para suas mãos e pés em uma única sessão, garantindo brilho, maciez e higiene impecáveis.",
      price: 70.00,
      duration: 80,
      image: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?q=80&w=800&auto=format&fit=crop",
      professional: "Samara"
    }
  ],
  clients: [
    {
      id: "cli_1",
      name: "Maria Oliveira Santos",
      phone: "+55 (11) 98765-4321",
      email: "maria.oli@outlook.com",
      birthDate: "1994-06-12",
      notes: "Prefere formato amendoado fino. Sensibilidade a lixamento de motor em rotação média-alta.",
      totalVisits: 12,
      totalSpent: 1450.00,
      createdAt: "2026-01-10"
    },
    {
      id: "cli_2",
      name: "Ana Caroline Souza",
      phone: "+55 (11) 99123-4567",
      email: "anacarol@gmail.com",
      birthDate: "1997-06-12",
      notes: "Gosta muito de nail art minimalista e tons de marrom e vermelho clássico.",
      totalVisits: 8,
      totalSpent: 880.00,
      createdAt: "2026-02-15"
    },
    {
      id: "cli_3",
      name: "Mariana Costa Ramos",
      phone: "+55 (11) 97722-1133",
      email: "maricosta.ramos@terra.com.br",
      birthDate: "1995-09-24",
      notes: "Sempre agenda Alongamento em Gel com encapsulada de glitter. Cutilagem delicada.",
      totalVisits: 5,
      totalSpent: 750.00,
      createdAt: "2026-03-20"
    },
    {
      id: "cli_4",
      name: "Juliana Mendes Abreu",
      phone: "+55 (11) 96543-9876",
      email: "jumendes92@gmail.com",
      birthDate: "1992-12-05",
      notes: "Usa Banho de Gel para manter unhas quadradas. Foco em esmaltação neutra/nude.",
      totalVisits: 3,
      totalSpent: 330.00,
      createdAt: "2026-04-12"
    }
  ],
  appointments: [
    {
      id: "apt_1",
      clientId: "cli_1",
      clientName: "Maria Oliveira Santos",
      clientPhone: "+55 (11) 98765-4321",
      date: "2026-06-11", // Today
      time: "10:00",
      procedureId: "cat_1",
      procedureName: "Alongamento",
      price: 160.00,
      status: "completed",
      notes: "Reconstrução com gel rosa leitoso.",
      professionalName: "Isabel Santos"
    },
    {
      id: "apt_2",
      clientId: "cli_2",
      clientName: "Ana Caroline Souza",
      clientPhone: "+55 (11) 99123-4567",
      date: "2026-06-11", // Today
      time: "14:00",
      procedureId: "cat_3",
      procedureName: "Esmaltação em Gel",
      price: 75.00,
      status: "completed",
      notes: "Tom vermelho paixão clássico.",
      professionalName: "Samara"
    },
    {
      id: "apt_3",
      clientId: "cli_3",
      clientName: "Mariana Costa Ramos",
      clientPhone: "+55 (11) 97722-1133",
      date: "2026-06-12", // Tomorrow (Perfect for reminder!)
      time: "09:30",
      procedureId: "cat_1",
      procedureName: "Alongamento",
      price: 160.00,
      status: "pending",
      notes: "Encapsulada de glitter degradê prata e esmeralda.",
      professionalName: "Isabel Santos"
    },
    {
      id: "apt_4",
      clientId: "cli_4",
      clientName: "Juliana Mendes Abreu",
      clientPhone: "+55 (11) 96543-9876",
      date: "2026-06-12", // Tomorrow (Perfect for reminder!)
      time: "15:00",
      procedureId: "cat_2",
      procedureName: "Banho de Gel (Blindagem)",
      price: 110.00,
      status: "pending",
      notes: "Esmaltação nude capuccino.",
      professionalName: "Isabel Santos"
    }
  ],
  finance: [
    // Pre-calculated metrics to seed the dashboard graphs nicely across 4 months
    { id: "fin_1", type: "income", amount: 1210.00, category: "Alongamento Gel", date: "2026-03-10", description: "Faturamento Quinzenal de Alongamento" },
    { id: "fin_2", type: "expense", amount: 150.00, category: "Lixas e Brocas", date: "2026-03-15", description: "Insumos rotativos" },
    { id: "fin_3", type: "income", amount: 840.00, category: "Esmaltação Gel", date: "2026-03-25", description: "Fechamento Quinzenal Esmaltação" },
    
    { id: "fin_4", type: "income", amount: 2650.00, category: "Alongamento Gel", date: "2026-04-05", description: "Alongamentos e Blindagens do mês" },
    { id: "fin_5", type: "expense", amount: 350.00, category: "Cabine LED/UV", date: "2026-04-10", description: "Cabine nova de backup" },
    { id: "fin_6", type: "income", amount: 980.00, category: "Spa e Manicure", date: "2026-04-20", description: "Serviços de manicure premium" },
    
    { id: "fin_7", type: "income", amount: 3340.00, category: "Alongamento Gel", date: "2026-05-02", description: "Concentração Dia das Mães Alongamentos" },
    { id: "fin_8", type: "expense", amount: 450.00, category: "Géis e Prep", date: "2026-05-15", description: "Repositor de Gel Xeque Mate e Desidrat" },
    { id: "fin_9", type: "expense", amount: 200.00, category: "Aluguel Sala", date: "2026-05-20", description: "Rateio de luz e água" },
    { id: "fin_10", type: "income", amount: 1420.00, category: "Nail Art", date: "2026-05-28", description: "Nail Art e Joias especiais" },
    
    // June 2026 current month
    { id: "fin_11", type: "income", amount: 160.00, category: "Alongamento Gel", date: "2026-06-11", description: "Faturamento - Maria Oliveira Santos" },
    { id: "fin_12", type: "income", amount: 75.00, category: "Esmaltação Gel", date: "2026-06-11", description: "Faturamento - Ana Caroline Souza" },
    { id: "fin_13", type: "expense", amount: 80.00, category: "Esmaltes Novas Cores", date: "2026-06-03", description: "Coleção de inverno" }
  ],
  reminders: []
};

// Database load/save helper
function readDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultDatabase, null, 2), 'utf-8');
      return defaultDatabase;
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading db file, restoring fallback:", err);
    return defaultDatabase;
  }
}

function writeDb(data: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error("Error writing db file:", err);
  }
}

// Ensure database file exists on boot
readDb();

// ----------------------
// BACKEND API ROUTES
// ----------------------

// 0. Database Status API
app.get('/api/db-status', async (req, res) => {
  if (!isSupabaseEnabled) {
    return res.json({
      status: 'local',
      supabaseConfigured: false,
      message: 'Utilizando banco de dados local em JSON (database.json). Para conectar à nuvem, ative as chaves SUPABASE_URL e SUPABASE_ANON_KEY.'
    });
  }
  try {
    const { data, error } = await supabase!.from('catalog').select('id').limit(1);
    if (error) {
      return res.json({
        status: 'supabase_error',
        supabaseConfigured: true,
        tablesCreated: false,
        message: `Conectado ao Supabase, mas falhou ao ler tabelas. Certifique-se de executar as migrations SQL no painel Admin. SQL Código: ${error.code || error.message}`
      });
    }
    return res.json({
      status: 'supabase_active',
      supabaseConfigured: true,
      tablesCreated: true,
      message: 'Conectado com sucesso ao banco de dados em nuvem Supabase!'
    });
  } catch (err: any) {
    return res.json({
      status: 'supabase_error',
      supabaseConfigured: true,
      tablesCreated: false,
      message: `Erro ao conectar na infraestrutura do Supabase: ${err.message || err}`
    });
  }
});

// Seed Supabase with default values
app.post('/api/db-seed', async (req, res) => {
  if (!isSupabaseEnabled) {
    return res.status(400).json({ error: 'Supabase não está configurado.' });
  }
  try {
    console.log("Iniciando semeadora de banco Supabase...");
    const { error: catErr } = await supabase!.from('catalog').upsert(defaultDatabase.catalog);
    const { error: cliErr } = await supabase!.from('clients').upsert(defaultDatabase.clients);
    const { error: aptErr } = await supabase!.from('appointments').upsert(defaultDatabase.appointments);
    const { error: finErr } = await supabase!.from('finance').upsert(defaultDatabase.finance);

    if (catErr || cliErr || aptErr || finErr) {
      return res.status(500).json({
        error: "Falha ao popular uma ou mais tabelas no Supabase",
        details: { catErr, cliErr, aptErr, finErr }
      });
    }

    return res.json({ success: true, message: "Dados padrão semeados com sucesso nas tabelas correspondentes do Supabase!" });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || err });
  }
});

// 1. Catalog API
app.get('/api/catalog', async (req, res) => {
  if (isSupabaseEnabled) {
    try {
      const { data, error } = await supabase!.from('catalog').select('*').order('id', { ascending: true });
      if (!error && data && data.length > 0) {
        return res.json(data);
      }
      if (error) {
        console.warn("Supabase Catalog fetch warning (may not have tables):", error.message);
      }
    } catch (e) {
      console.warn("Supabase Catalog try exception, falling back:", e);
    }
  }
  const db = readDb();
  res.json(db.catalog);
});

// 2. Clients API (CRM)
app.get('/api/clients', async (req, res) => {
  if (isSupabaseEnabled) {
    try {
      const { data, error } = await supabase!.from('clients').select('*').order('name', { ascending: true });
      if (!error && data) {
        return res.json(data);
      }
      console.warn("Supabase Clients fetch error, falling back:", error?.message);
    } catch (e) {
      console.warn("Supabase Clients fetch exception, falling back:", e);
    }
  }
  const db = readDb();
  res.json(db.clients);
});

app.post('/api/clients', async (req, res) => {
  const { name, phone, email, birthDate, notes } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: "Nome e telefone são campos necessários" });
  }

  if (isSupabaseEnabled) {
    try {
      // Clean phone lookup
      const searchPhone = phone.trim();
      const { data: existing, error: findError } = await supabase!.from('clients')
        .select('*')
        .eq('phone', searchPhone)
        .maybeSingle();

      if (!findError && existing) {
        // Update existing crm record
        const updatedFields: any = { name };
        if (email !== undefined) updatedFields.email = email;
        if (birthDate !== undefined) updatedFields.birthDate = birthDate;
        if (notes !== undefined) updatedFields.notes = notes;

        const { data: updatedData, error: updateError } = await supabase!.from('clients')
          .update(updatedFields)
          .eq('id', existing.id)
          .select()
          .single();

        if (!updateError && updatedData) {
          return res.status(200).json(updatedData);
        }
      } else if (!findError) {
        // Create new record
        const newClient = {
          id: 'cli_' + Date.now(),
          name,
          phone: searchPhone,
          email: email || '',
          birthDate: birthDate || '',
          notes: notes || '',
          totalVisits: 0,
          totalSpent: 0,
          createdAt: new Date().toISOString().split('T')[0]
        };

        const { data: createdData, error: insertError } = await supabase!.from('clients')
          .insert(newClient)
          .select()
          .single();

        if (!insertError && createdData) {
          return res.status(201).json(createdData);
        }
      }
    } catch (e) {
      console.warn("Supabase CRM create client failed, reverting to JSON db:", e);
    }
  }

  // Local JSON Backup flow
  const db = readDb();
  let existing = db.clients.find(c => c.phone.trim() === phone.trim());
  if (existing) {
    existing.name = name;
    if (email) existing.email = email;
    if (birthDate) existing.birthDate = birthDate;
    if (notes) existing.notes = notes;
    writeDb(db);
    return res.status(200).json(existing);
  }

  const newClient = {
    id: 'cli_' + Date.now(),
    name,
    phone,
    email: email || '',
    birthDate: birthDate || '',
    notes: notes || '',
    totalVisits: 0,
    totalSpent: 0,
    createdAt: new Date().toISOString().split('T')[0]
  };
  db.clients.push(newClient);
  writeDb(db);
  res.status(201).json(newClient);
});

app.put('/api/clients/:id', async (req, res) => {
  const { id } = req.params;
  const updatePayload = {
    name: req.body.name,
    phone: req.body.phone,
    email: req.body.email,
    birthDate: req.body.birthDate,
    notes: req.body.notes,
  };

  const fieldsToUpdate = Object.fromEntries(
    Object.entries(updatePayload).filter(([_, v]) => v !== undefined)
  );

  if (isSupabaseEnabled) {
    try {
      const { data, error } = await supabase!.from('clients')
        .update(fieldsToUpdate)
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        return res.json(data);
      }
    } catch (e) {
      console.warn("Supabase PUT clients failed, using fallback:", e);
    }
  }

  const db = readDb();
  const idx = db.clients.findIndex(c => c.id === id);
  if (idx !== -1) {
    db.clients[idx] = {
      ...db.clients[idx],
      ...fieldsToUpdate
    };
    writeDb(db);
    res.json(db.clients[idx]);
  } else {
    res.status(404).json({ error: "Client not found" });
  }
});

app.delete('/api/clients/:id', async (req, res) => {
  const { id } = req.params;

  if (isSupabaseEnabled) {
    try {
      const { error } = await supabase!.from('clients').delete().eq('id', id);
      if (!error) {
        return res.json({ message: "Client deleted successfully" });
      }
    } catch (e) {
      console.warn("Supabase clients delete error, falling back:", e);
    }
  }

  const db = readDb();
  db.clients = db.clients.filter(c => c.id !== id);
  writeDb(db);
  res.json({ message: "Client deleted successfully" });
});

// 3. Appointments API
app.get('/api/appointments', async (req, res) => {
  if (isSupabaseEnabled) {
    try {
      const { data, error } = await supabase!.from('appointments').select('*').order('date', { ascending: true });
      if (!error && data) {
        return res.json(data);
      }
    } catch (e) {
      console.warn("Supabase appointments load failure, falling back:", e);
    }
  }
  const db = readDb();
  res.json(db.appointments);
});

app.post('/api/appointments', async (req, res) => {
  const { clientName, clientPhone, date, time, procedureId, notes } = req.body;
  
  if (!clientName || !clientPhone || !date || !time || !procedureId) {
    return res.status(400).json({ error: "Campos obrigatórios ausentes" });
  }

  if (isSupabaseEnabled) {
    try {
      const { data: selectedItem, error: catError } = await supabase!.from('catalog')
        .select('*')
        .eq('id', procedureId)
        .maybeSingle();

      if (!catError && selectedItem) {
        // Query conflicts
        const { data: conflicts, error: checkError } = await supabase!.from('appointments')
          .select('*')
          .eq('date', date)
          .eq('time', time)
          .neq('status', 'cancelled')
          .eq('professionalName', selectedItem.professional);

        if (!checkError && conflicts && conflicts.length > 0) {
          return res.status(400).json({ error: `O horário ${time}h já está reservado com a profissional ${selectedItem.professional} neste dia.` });
        }

        // Get or Create client CRM
        let { data: clientObj, error: findCliError } = await supabase!.from('clients')
          .select('*')
          .eq('phone', clientPhone.trim())
          .maybeSingle();

        let clientObjId = '';

        if (!findCliError && !clientObj) {
          const newCli = {
            id: 'cli_' + Date.now(),
            name: clientName,
            phone: clientPhone,
            email: req.body.clientEmail || '',
            birthDate: req.body.clientBirthDate || '',
            notes: notes || '',
            totalVisits: 0,
            totalSpent: 0,
            createdAt: new Date().toISOString().split('T')[0]
          };

          const { data: createdCli, error: insertError } = await supabase!.from('clients')
            .insert(newCli)
            .select()
            .single();

          if (!insertError && createdCli) {
            clientObjId = createdCli.id;
          } else {
            clientObjId = newCli.id;
          }
        } else if (clientObj) {
          clientObjId = clientObj.id;
          const updates: any = {};
          if (req.body.clientEmail && !clientObj.email) updates.email = req.body.clientEmail;
          if (req.body.clientBirthDate && !clientObj.birthDate) updates.birthDate = req.body.clientBirthDate;
          if (Object.keys(updates).length > 0) {
            await supabase!.from('clients').update(updates).eq('id', clientObj.id);
          }
        }

        const newAppointment = {
          id: 'apt_' + Date.now(),
          clientId: clientObjId || ('cli_' + Date.now()),
          clientName: clientName,
          clientPhone: clientPhone,
          date,
          time,
          procedureId,
          procedureName: selectedItem.name,
          price: selectedItem.price,
          status: 'pending',
          notes: notes || '',
          professionalName: selectedItem.professional
        };

        const { data: createdApt, error: aptInsertError } = await supabase!.from('appointments')
          .insert(newAppointment)
          .select()
          .single();

        if (!aptInsertError && createdApt) {
          return res.status(201).json(createdApt);
        }
      }
    } catch (e) {
      console.warn("Supabase appointment insert failed, using JSON db fallback:", e);
    }
  }

  // Backup script
  const db = readDb();
  const selectedItem = db.catalog.find(item => item.id === procedureId);
  if (!selectedItem) {
    return res.status(404).json({ error: "Procedimento não encontrado" });
  }

  const isSlotTaken = db.appointments.some(apt => 
    apt.date === date && 
    apt.time === time && 
    apt.status !== 'cancelled' && 
    (apt.professionalName || "Isabel Santos") === selectedItem.professional
  );

  if (isSlotTaken) {
    return res.status(400).json({ error: `O horário ${time}h já está reservado com a profissional ${selectedItem.professional} neste dia.` });
  }

  let client = db.clients.find(c => c.phone.trim() === clientPhone.trim());
  if (!client) {
    client = {
      id: 'cli_' + Date.now(),
      name: clientName,
      phone: clientPhone,
      email: req.body.clientEmail || '',
      birthDate: req.body.clientBirthDate || '',
      notes: notes || '',
      totalVisits: 0,
      totalSpent: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    db.clients.push(client);
  } else {
    if (req.body.clientEmail && !client.email) {
      client.email = req.body.clientEmail;
    }
    if (req.body.clientBirthDate && !client.birthDate) {
      client.birthDate = req.body.clientBirthDate;
    }
  }

  const newAppointment = {
    id: 'apt_' + Date.now(),
    clientId: client.id,
    clientName,
    clientPhone,
    date,
    time,
    procedureId,
    procedureName: selectedItem.name,
    price: selectedItem.price,
    status: 'pending',
    notes: notes || '',
    professionalName: selectedItem.professional
  };

  db.appointments.push(newAppointment);
  writeDb(db);
  res.status(201).json(newAppointment);
});

app.put('/api/appointments/:id', async (req, res) => {
  const { id } = req.params;
  const { status, date, time, notes } = req.body;

  if (isSupabaseEnabled) {
    try {
      const { data: oldApt, error: getError } = await supabase!.from('appointments')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (!getError && oldApt) {
        const newStatus = status || oldApt.status;
        const updatedFields = {
          status: newStatus,
          date: date || oldApt.date,
          time: time || oldApt.time,
          notes: notes !== undefined ? notes : oldApt.notes
        };

        const { error: updErr } = await supabase!.from('appointments')
          .update(updatedFields)
          .eq('id', id);

        if (!updErr) {
          // If completing appointment, update client totalVisits & totalSpent, and add income finance entry
          if (oldApt.status !== 'completed' && newStatus === 'completed') {
            const { data: clientObj } = await supabase!.from('clients')
              .select('*')
              .eq('id', oldApt.clientId)
              .maybeSingle();

            if (clientObj) {
              await supabase!.from('clients')
                .update({
                  totalVisits: Number(clientObj.totalVisits || 0) + 1,
                  totalSpent: Number(clientObj.totalSpent || 0) + oldApt.price
                })
                .eq('id', clientObj.id);
            }

            const newFinanceEntry = {
              id: 'fin_' + Date.now(),
              type: 'income',
              amount: oldApt.price,
              category: oldApt.procedureName.includes("Gel") ? "Alongamento Gel" : (oldApt.procedureName.includes("Esmalt") ? "Esmaltação Gel" : "Spa e Manicure"),
              date: updatedFields.date,
              description: `Faturamento - ${oldApt.clientName} (${oldApt.procedureName})`
            };
            await supabase!.from('finance').insert(newFinanceEntry);
          }
          return res.json({ ...oldApt, ...updatedFields });
        }
      }
    } catch (e) {
      console.warn("Supabase Appointments update error, using fallback:", e);
    }
  }

  // Fallback
  const db = readDb();
  const aptIdx = db.appointments.findIndex(a => a.id === id);
  if (aptIdx === -1) {
    return res.status(404).json({ error: "Formulário de agendamento não encontrado" });
  }
  
  const oldApt = db.appointments[aptIdx];
  const newStatus = status || oldApt.status;
  
  const updatedApt = {
    ...oldApt,
    status: newStatus,
    date: date || oldApt.date,
    time: time || oldApt.time,
    notes: notes !== undefined ? notes : oldApt.notes
  };
  
  db.appointments[aptIdx] = updatedApt;

  if (oldApt.status !== 'completed' && newStatus === 'completed') {
    const clientIdx = db.clients.findIndex(c => c.id === oldApt.clientId);
    if (clientIdx !== -1) {
      db.clients[clientIdx].totalVisits += 1;
      db.clients[clientIdx].totalSpent += oldApt.price;
    }
    
    const newFinanceEntry = {
      id: 'fin_' + Date.now(),
      type: 'income',
      amount: oldApt.price,
      category: oldApt.procedureName.includes("Gel") ? "Alongamento Gel" : (oldApt.procedureName.includes("Esmalt") ? "Esmaltação Gel" : "Spa e Manicure"),
      date: updatedApt.date,
      description: `Faturamento - ${updatedApt.clientName} (${updatedApt.procedureName})`
    };
    db.finance.push(newFinanceEntry);
  }
  
  writeDb(db);
  res.json(updatedApt);
});

app.delete('/api/appointments/:id', async (req, res) => {
  const { id } = req.params;

  if (isSupabaseEnabled) {
    try {
      const { error } = await supabase!.from('appointments').delete().eq('id', id);
      if (!error) {
        return res.json({ message: "Appointment deleted" });
      }
    } catch (e) {
      console.warn("Supabase DELETE appointments failed:", e);
    }
  }

  const db = readDb();
  db.appointments = db.appointments.filter(a => a.id !== id);
  writeDb(db);
  res.json({ message: "Appointment deleted" });
});

// 4. Finance API
app.get('/api/finance', async (req, res) => {
  if (isSupabaseEnabled) {
    try {
      const { data, error } = await supabase!.from('finance').select('*').order('date', { ascending: false });
      if (!error && data) {
        return res.json(data);
      }
    } catch (e) {
      console.warn("Supabase Finance entries loading failed:", e);
    }
  }
  const db = readDb();
  res.json(db.finance);
});

app.post('/api/finance', async (req, res) => {
  const db = readDb();
  const { 
    type, 
    amount, 
    category, 
    date, 
    description,
    isRawMaterial,
    isRecurring,
    recurringFrequency,
    qty,
    unitPrice
  } = req.body;
  
  if (!type || !amount || !category || !date) {
    return res.status(400).json({ error: "Preencha todos os campos obrigatórios" });
  }

  const newEntry = {
    id: 'fin_' + Date.now(),
    type,
    amount: Number(amount),
    category,
    date,
    description: description || '',
    isRawMaterial: !!isRawMaterial,
    isRecurring: !!isRecurring,
    recurringFrequency: recurringFrequency || null,
    qty: qty ? Number(qty) : null,
    unitPrice: unitPrice ? Number(unitPrice) : null
  };

  if (isSupabaseEnabled) {
    try {
      const { data, error } = await supabase!.from('finance')
        .insert(newEntry)
        .select()
        .single();

      if (!error && data) {
        return res.status(201).json(data);
      }
    } catch (e) {
      console.warn("Supabase Finance create error, calling fallback:", e);
    }
  }

  db.finance.push(newEntry);
  writeDb(db);
  res.status(201).json(newEntry);
});

app.delete('/api/finance/:id', async (req, res) => {
  const { id } = req.params;

  if (isSupabaseEnabled) {
    try {
      const { error } = await supabase!.from('finance').delete().eq('id', id);
      if (!error) {
        return res.json({ message: "Financial entry deleted" });
      }
    } catch (e) {
      console.warn("Supabase Finance delete failed:", e);
    }
  }

  const db = readDb();
  db.finance = db.finance.filter(f => f.id !== id);
  writeDb(db);
  res.json({ message: "Financial entry deleted" });
});

// 5. WhatsApp Reminder AI Generation (Using Gemini 3.5 Flash server side)
app.post('/api/generate-reminder', async (req, res) => {
  const { clientName, procedureName, date, time, businessName, professionalName } = req.body;
  
  if (!clientName || !procedureName || !date || !time) {
    return res.status(400).json({ error: "Alguns dados de agendamento estão ausentes para gerar o lembrete." });
  }

  const [year, month, day] = date.split('-');
  const formattedDate = `${day}/${month}`;
  const bizName = businessName || "Isabel Santos Nail Designer";
  const targetProf = professionalName || "Isabel Santos";

  try {
    const prompt = `Gere uma mensagem personalizada de lembrete de agendamento pelo WhatsApp para a cliente "${clientName}".
Ela agendou o procedimento de "${procedureName}" no dia ${formattedDate} às ${time} com a profissional "${targetProf}" no espaço "${bizName}".

Instruções importantes:
- A mensagem deve ser simpática, acolhedora, profissional e amigável.
- Use emojis apropriados do nicho (como 💅, ✨, 🌸, 💕) de forma harmoniosa que chame atenção.
- Mencione que se surgir algum imprevisto, para avisar com antecedência.
- Lembre a cliente de chegar com 5 minutinhos de antecedência.
- Escreva a resposta final PURA, sem aspas adicionais, sem títulos de introdução e pronta para enviar pelo WhatsApp.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });

    const generatedText = response.text || '';
    res.json({ message: generatedText.trim() });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    const fallbackMessage = `Olá, *${clientName}*! ✨ 

Passando para lembrar do seu momento de autocuidado com *${targetProf}* no espaço *Isabel Santos Nail Designer* 💅

🗓️ *Data:* ${formattedDate}
⏰ *Horário:* ${time}h
🌸 *Procedimento:* ${procedureName}

Pedimos que chegue com 5 ou 10 minutos de antecedência para tomarmos um cafezinho. Se houver algum imprevisto, nos avise com antecedência por aqui.

Estamos ansiosas para te deixar ainda mais maravilhosa! Até lá! 💕✨`;
    res.json({ message: fallbackMessage, isFallback: true });
  }
});

// 6. Reminders Log API
app.get('/api/reminders', async (req, res) => {
  if (isSupabaseEnabled) {
    try {
      const { data, error } = await supabase!.from('reminders').select('*').order('id', { ascending: false });
      if (!error && data) {
        return res.json(data);
      }
    } catch (e) {
      console.warn("Supabase get reminders failed:", e);
    }
  }
  const db = readDb();
  res.json(db.reminders || []);
});

app.post('/api/reminders', async (req, res) => {
  const newLog = {
    id: 'rem_' + Date.now(),
    appointmentId: req.body.appointmentId,
    clientName: req.body.clientName,
    phone: req.body.phone,
    messageText: req.body.messageText,
    status: 'sent',
    sentAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString('pt-BR')
  };

  if (isSupabaseEnabled) {
    try {
      const { data, error } = await supabase!.from('reminders')
        .insert(newLog)
        .select()
        .single();
      if (!error && data) {
        return res.status(201).json(data);
      }
    } catch (e) {
      console.warn("Supabase record reminder failed:", e);
    }
  }

  const db = readDb();
  if (!db.reminders) db.reminders = [];
  db.reminders.push(newLog);
  writeDb(db);
  res.status(201).json(newLog);
});


// ------------------------------------------
// VITE MIDDLEWARE SETUP & STATIC SERVER
// ------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
