import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

export const dynamic = 'force-dynamic';

// GitHub yapılandırması
const GITHUB_TOKEN = process.env.GITHUB_BACKUP_TOKEN || '';
const GITHUB_REPO = 'grbt8yedek/cronbackup';
const BACKUP_SECRET = process.env.BACKUP_SECRET_TOKEN || 'BACKUP_SECRET_TOKEN_2025';

// Son backup zamanını kontrol et
async function getLastBackupTime(): Promise<Date | null> {
  try {
    const backupDir = path.join(process.cwd(), 'backups', 'scheduled');
    if (!fs.existsSync(backupDir)) {
      return null;
    }
    
    const files = fs.readdirSync(backupDir)
      .filter(file => file.startsWith('grbt8-backup-'))
      .sort()
      .reverse();
    
    if (files.length === 0) return null;
    
    const lastFile = files[0];
    const stats = fs.statSync(path.join(backupDir, lastFile));
    return stats.mtime;
  } catch (error) {
    console.error('Son backup zamanı alınamadı:', error);
    return null;
  }
}

// ZIP dosyası oluştur (Node.js built-in)
function createZipFile(files: { name: string, content: string }[], zipPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // Basit ZIP oluşturma (Node.js built-in ile)
      const { execSync } = require('child_process');
      
      // Geçici klasör oluştur
      const tempDir = path.join(process.cwd(), 'temp-backup');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      // Dosyaları yaz
      files.forEach(file => {
        fs.writeFileSync(path.join(tempDir, file.name), file.content);
      });
      
      // ZIP oluştur
      execSync(`cd "${tempDir}" && zip -r "${zipPath}" .`, { stdio: 'pipe' });
      
      // Geçici klasörü sil
      execSync(`rm -rf "${tempDir}"`);
      
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

// Tüm database verilerini yedekle
async function createFullBackup(): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(process.cwd(), 'backups', 'scheduled');
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  console.log('🔄 Full database backup oluşturuluyor...');

  // Tüm tabloları yedekle
  const backup = {
    metadata: {
      timestamp: new Date().toISOString(),
      version: '2.0',
      environment: process.env.NODE_ENV || 'production',
      backupType: 'scheduled',
      description: 'Otomatik zamanlanmış backup - 6 saatte bir'
    },
    schema: {
      // Prisma schema'yı oku
      prismaSchema: fs.readFileSync(path.join(process.cwd(), 'prisma', 'schema.prisma'), 'utf8')
    },
    data: {
      // Kullanıcılar
      users: await prisma.user.findMany({
        include: {
          passengers: true,
          reservations: true,
          priceAlerts: true,
          searchFavorites: true
        }
      }),
      
      // Rezervasyonlar
      reservations: await prisma.reservation.findMany({
        include: {
          user: true,
          payment: true
        }
      }),
      
      // Yolcular
      passengers: await prisma.passenger.findMany({
        include: {
          user: true
        }
      }),
      
      // Kampanyalar
      campaigns: await prisma.campaign.findMany(),
      
      // Fiyat alarmları
      priceAlerts: await prisma.priceAlert.findMany({
        include: {
          user: true
        }
      }),
      
      // Arama favorileri
      searchFavorites: await prisma.searchFavorite.findMany({
        include: {
          user: true
        }
      }),
      
      // Anket yanıtları
      surveyResponses: await prisma.surveyResponse.findMany(),
      
      // Email kuyruğu
      emailQueue: await prisma.emailQueue.findMany(),
      
      // Sistem ayarları
      systemSettings: await prisma.systemSettings.findMany(),
      
      // Email template'leri
      emailTemplates: await prisma.emailTemplate.findMany(),
      
      // Email logları
      emailLogs: await prisma.emailLog.findMany(),
      
      // Email ayarları
      emailSettings: await prisma.emailSettings.findMany(),
      
      // Sistem logları
      systemLogs: await prisma.systemLog.findMany(),
      
      // Faturalama bilgileri
      billingInfos: await prisma.billingInfo.findMany()
    },
    statistics: {
      totalUsers: 0,
      totalReservations: 0,
      totalPassengers: 0,
      totalCampaigns: 0,
      totalPriceAlerts: 0,
      totalSearchFavorites: 0,
      totalSurveyResponses: 0,
      totalEmailTemplates: 0,
      totalSystemLogs: 0,
      backupSize: 0
    }
  };

  // İstatistikleri hesapla
  backup.statistics.totalUsers = backup.data.users.length;
  backup.statistics.totalReservations = backup.data.reservations.length;
  backup.statistics.totalPassengers = backup.data.passengers.length;
  backup.statistics.totalCampaigns = backup.data.campaigns.length;
  backup.statistics.totalPriceAlerts = backup.data.priceAlerts.length;
  backup.statistics.totalSearchFavorites = backup.data.searchFavorites.length;
  backup.statistics.totalSurveyResponses = backup.data.surveyResponses.length;
  backup.statistics.totalEmailTemplates = backup.data.emailTemplates.length;
  backup.statistics.totalSystemLogs = backup.data.systemLogs.length;

  // JSON dosyasını oluştur
  const jsonData = JSON.stringify(backup, null, 2);
  backup.statistics.backupSize = Buffer.byteLength(jsonData, 'utf8');

  // ZIP dosyası oluştur
  const zipFile = path.join(backupDir, `grbt8-backup-${timestamp}.zip`);
  
  try {
    await createZipFile([
      { name: `grbt8-backup-${timestamp}.json`, content: jsonData }
    ], zipFile);
    
    console.log(`✅ ZIP backup oluşturuldu: ${zipFile}`);
    return zipFile;
  } catch (error) {
    console.error('ZIP oluşturma hatası:', error);
    // ZIP oluşturamazsa JSON dosyasını kaydet
    const jsonFile = path.join(backupDir, `grbt8-backup-${timestamp}.json`);
    fs.writeFileSync(jsonFile, jsonData);
    return jsonFile;
  }
}

// GitHub'a backup yükle
async function pushToGitHub(filePath: string): Promise<boolean> {
  try {
    if (!GITHUB_TOKEN) {
      console.log('⚠️ GitHub token bulunamadı, backup yerel olarak saklanacak');
      return false;
    }

    const fileName = path.basename(filePath);
    const fileContent = fs.readFileSync(filePath);
    const base64Content = fileContent.toString('base64');

    // GitHub API ile dosya yükle
    const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${fileName}`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Otomatik backup - ${new Date().toISOString()}`,
        content: base64Content,
        branch: 'main'
      })
    });

    if (response.ok) {
      console.log(`✅ GitHub'a yüklendi: ${fileName}`);
      return true;
    } else {
      const errorData = await response.json();
      console.error('❌ GitHub yükleme hatası:', errorData);
      return false;
    }
  } catch (error) {
    console.error('❌ GitHub push hatası:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authorization kontrolü
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.includes(BACKUP_SECRET)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Son backup zamanını kontrol et (6 saatlik interval)
    const lastBackup = await getLastBackupTime();
    const now = new Date();
    
    if (lastBackup) {
      const hoursDiff = (now.getTime() - lastBackup.getTime()) / (1000 * 60 * 60);
      
      if (hoursDiff < 6) {
        console.log(`⏰ Henüz 6 saat geçmedi (${hoursDiff.toFixed(1)} saat), backup atlanıyor`);
        return NextResponse.json({
          success: true,
          message: 'Backup atlandı - henüz 6 saat geçmedi',
          lastBackup: lastBackup.toISOString(),
          nextBackup: new Date(lastBackup.getTime() + (6 * 60 * 60 * 1000)).toISOString(),
          hoursSinceLastBackup: hoursDiff
        });
      }
    }

    console.log('🚀 Zamanlanmış backup başlatılıyor...');

    // Full backup oluştur
    const backupFilePath = await createFullBackup();
    
    // GitHub'a yükle
    const uploaded = await pushToGitHub(backupFilePath);
    
    // Yerel dosyayı sil (opsiyonel)
    if (uploaded) {
      fs.unlinkSync(backupFilePath);
      console.log('🗑️ Yerel backup dosyası silindi');
    }

    // Eski backup'ları temizle (son 10 tanesini sakla)
    const backupDir = path.join(process.cwd(), 'backups', 'scheduled');
    if (fs.existsSync(backupDir)) {
      const files = fs.readdirSync(backupDir)
        .filter(file => file.startsWith('grbt8-backup-'))
        .sort()
        .reverse();
      
      if (files.length > 10) {
        files.slice(10).forEach(file => {
          fs.unlinkSync(path.join(backupDir, file));
          console.log(`🗑️ Eski backup silindi: ${file}`);
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Backup başarıyla oluşturuldu ve GitHub\'a yüklendi',
      timestamp: now.toISOString(),
      uploaded: uploaded,
      nextBackup: new Date(now.getTime() + (6 * 60 * 60 * 1000)).toISOString()
    });

  } catch (error: any) {
    console.error('❌ Scheduled backup hatası:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// GET endpoint - backup durumunu kontrol et
export async function GET(request: NextRequest) {
  try {
    const lastBackup = await getLastBackupTime();
    const now = new Date();
    
    let hoursSinceLastBackup = 0;
    let nextBackup = now;
    
    if (lastBackup) {
      hoursSinceLastBackup = (now.getTime() - lastBackup.getTime()) / (1000 * 60 * 60);
      nextBackup = new Date(lastBackup.getTime() + (6 * 60 * 60 * 1000));
    }

    return NextResponse.json({
      success: true,
      status: 'active',
      schedule: '6 hours',
      lastBackup: lastBackup?.toISOString() || null,
      nextBackup: nextBackup.toISOString(),
      hoursSinceLastBackup: hoursSinceLastBackup,
      readyForBackup: hoursSinceLastBackup >= 6 || !lastBackup
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
