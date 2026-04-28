import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs/promises";

interface AppService {
  id: string;
  name: string;
  description: string;
  url: string;
  iconName: string;
  category: string;
  status: 'online' | 'warning' | 'offline';
}

const DATA_FILE = path.join(process.cwd(), 'services.json');

async function ensureDataFile() {
  try {
    await fs.access(DATA_FILE);
  } catch {
    const defaultServices = [
      {
        id: 'graylog',
        name: 'Graylog',
        description: 'Coletar logs, monitorar eventos em tempo real e gerenciar grandes volumes de dados de log de forma eficiente.',
        url: 'http://graylog.inema.intranet:9000/',
        iconName: 'Terminal',
        category: 'Monitoramento',
        status: 'online'
      },
      {
        id: 'netbox',
        name: 'Netbox',
        description: 'Gerenciamento de infraestrutura de rede, inventário de equipamentos e documentação de rede.',
        url: 'http://netbox.inema.ba.gov.br/',
        iconName: 'Database',
        category: 'Infraestrutura',
        status: 'online'
      },
      {
        id: 'storage',
        name: 'Monitoramento Storage',
        description: 'Monitoramento dos servidores de arquivos e saúde do storage.',
        url: 'http://172.16.0.7:5000/',
        iconName: 'HardDrive',
        category: 'Monitoramento',
        status: 'online'
      },
      {
        id: 'wifi',
        name: 'Gerenciamento Wifi',
        description: 'Monitoramento de Wifi e controle de acesso à infraestrutura.',
        url: 'http://172.16.6.4:3000/',
        iconName: 'Wifi',
        category: 'Rede',
        status: 'online'
      },
      {
        id: 'security',
        name: 'Segurança',
        description: 'Plataforma de segurança para gerenciamento de vulnerabilidades, ameaças e conformidade.',
        url: 'https://seguranca.inema.ba.gov.br/app/login?',
        iconName: 'ShieldCheck',
        category: 'Segurança',
        status: 'online'
      },
      {
        id: 'zabbix',
        name: 'Zabbix',
        description: 'Ferramenta de monitoramento para infraestrutura, servidores e aplicações.',
        url: 'http://noc-zbx.inema.ba.gov.br/zabbix/index.php',
        iconName: 'Activity',
        category: 'Monitoramento',
        status: 'online'
      }
    ];
    await fs.writeFile(DATA_FILE, JSON.stringify(defaultServices, null, 2));
  }
}

async function startServer() {
  await ensureDataFile();
  const app = express();
  const PORT = 10000;

  app.use(express.json());

  // API Routes
  app.get("/api/services", async (req, res) => {
    try {
      const data = await fs.readFile(DATA_FILE, 'utf-8');
      res.json(JSON.parse(data));
    } catch (err) {
      res.status(500).json({ error: "Failed to read data" });
    }
  });

  app.post("/api/services", async (req, res) => {
    try {
      const services: AppService[] = req.body;
      await fs.writeFile(DATA_FILE, JSON.stringify(services, null, 2));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to save data" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
