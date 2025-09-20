#!/usr/bin/env node

/**
 * SCHEMA GUARD - Prisma Schema Koruması
 * Schema değişikliklerini kontrol eder ve onay ister
 */

const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

class SchemaGuard {
  constructor() {
    this.schemaPath = path.join(__dirname, '../prisma/schema.prisma')
    this.backupPath = path.join(__dirname, '../backups/schema-backups')
    this.ensureBackupDir()
  }

  ensureBackupDir() {
    if (!fs.existsSync(this.backupPath)) {
      fs.mkdirSync(this.backupPath, { recursive: true })
    }
  }

  // Schema hash hesapla
  calculateSchemaHash() {
    if (!fs.existsSync(this.schemaPath)) {
      return null
    }
    
    const content = fs.readFileSync(this.schemaPath, 'utf8')
    return crypto.createHash('sha256').update(content).digest('hex')
  }

  // Schema backup oluştur
  createSchemaBackup(reason = 'manual') {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupFile = path.join(this.backupPath, `schema-${timestamp}-${reason}.prisma`)
    
    if (fs.existsSync(this.schemaPath)) {
      fs.copyFileSync(this.schemaPath, backupFile)
      console.log(`✅ Schema backup oluşturuldu: ${backupFile}`)
      return backupFile
    }
    
    return null
  }

  // Tehlikeli değişiklikleri kontrol et
  checkDangerousChanges(oldContent, newContent) {
    const warnings = []
    
    // Tablo silme kontrolü
    const oldTables = this.extractTables(oldContent)
    const newTables = this.extractTables(newContent)
    
    const deletedTables = oldTables.filter(table => !newTables.includes(table))
    if (deletedTables.length > 0) {
      warnings.push(`🚨 SİLİNEN TABLOLAR: ${deletedTables.join(', ')}`)
    }

    // Unique constraint kaldırma
    if (oldContent.includes('@unique') && !newContent.includes('@unique')) {
      warnings.push('⚠️  Unique constraint kaldırıldı')
    }

    // Primary key değişikliği
    const oldPrimaryKeys = this.extractPrimaryKeys(oldContent)
    const newPrimaryKeys = this.extractPrimaryKeys(newContent)
    
    if (JSON.stringify(oldPrimaryKeys) !== JSON.stringify(newPrimaryKeys)) {
      warnings.push('⚠️  Primary key değişikliği tespit edildi')
    }

    // Relation değişiklikleri
    if (this.hasRelationChanges(oldContent, newContent)) {
      warnings.push('⚠️  Model ilişkilerinde değişiklik')
    }

    return warnings
  }

  extractTables(content) {
    const tableRegex = /model\s+(\w+)/g
    const tables = []
    let match
    
    while ((match = tableRegex.exec(content)) !== null) {
      tables.push(match[1])
    }
    
    return tables
  }

  extractPrimaryKeys(content) {
    const primaryKeyRegex = /(\w+)\s+@id/g
    const primaryKeys = {}
    let match
    
    while ((match = primaryKeyRegex.exec(content)) !== null) {
      const table = this.getTableName(content, match.index)
      if (table) {
        primaryKeys[table] = match[1]
      }
    }
    
    return primaryKeys
  }

  getTableName(content, position) {
    const beforePosition = content.substring(0, position)
    const modelMatch = beforePosition.match(/model\s+(\w+)/g)
    
    if (modelMatch && modelMatch.length > 0) {
      const lastModel = modelMatch[modelMatch.length - 1]
      return lastModel.replace('model ', '')
    }
    
    return null
  }

  hasRelationChanges(oldContent, newContent) {
    const oldRelations = this.extractRelations(oldContent)
    const newRelations = this.extractRelations(newContent)
    
    return JSON.stringify(oldRelations) !== JSON.stringify(newRelations)
  }

  extractRelations(content) {
    const relationRegex = /@relation\([^)]+\)/g
    const relations = []
    let match
    
    while ((match = relationRegex.exec(content)) !== null) {
      relations.push(match[0])
    }
    
    return relations.sort()
  }

  // Schema değişiklik onayı
  async requestSchemaApproval(warnings) {
    const readline = require('readline')
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    return new Promise((resolve) => {
      console.log('\n' + '='.repeat(60))
      console.log('🔒 PRISMA SCHEMA DEĞİŞİKLİĞİ TESPİT EDİLDİ')
      console.log('='.repeat(60))
      
      if (warnings.length > 0) {
        console.log('\n⚠️  UYARILAR:')
        warnings.forEach(warning => console.log(`   ${warning}`))
      }
      
      console.log('\nBu değişiklik veritabanı yapısını etkileyebilir!')
      console.log('Devam etmek için "SCHEMA-ONAY" yazın')
      console.log('='.repeat(60))
      
      rl.question('Onayınız: ', (answer) => {
        rl.close()
        resolve(answer === 'SCHEMA-ONAY')
      })
    })
  }

  // Ana guard fonksiyonu
  async guardSchemaChange(newContent) {
    // Mevcut schema backup'ını oluştur
    this.createSchemaBackup('pre-change')
    
    // Eğer eski schema yoksa (ilk kez oluşturuluyor)
    if (!fs.existsSync(this.schemaPath)) {
      console.log('✅ Yeni schema dosyası oluşturuluyor')
      return { allowed: true }
    }

    const oldContent = fs.readFileSync(this.schemaPath, 'utf8')
    
    // Tehlikeli değişiklikleri kontrol et
    const warnings = this.checkDangerousChanges(oldContent, newContent)
    
    // Eğer uyarı yoksa izin ver
    if (warnings.length === 0) {
      console.log('✅ Güvenli schema değişikliği')
      return { allowed: true }
    }

    // Uyarılı değişiklik için onay iste
    const approved = await this.requestSchemaApproval(warnings)
    
    if (approved) {
      console.log('✅ Schema değişikliği onaylandı')
      return { allowed: true, warnings }
    } else {
      console.log('❌ Schema değişikliği iptal edildi')
      return { allowed: false, warnings }
    }
  }
}

// CLI kullanımı
if (require.main === module) {
  const guard = new SchemaGuard()
  const newSchemaPath = process.argv[2]
  
  if (!newSchemaPath) {
    console.log('Kullanım: node schema-guard.js "yeni-schema-dosyası"')
    process.exit(1)
  }

  if (!fs.existsSync(newSchemaPath)) {
    console.log('❌ Yeni schema dosyası bulunamadı')
    process.exit(1)
  }

  const newContent = fs.readFileSync(newSchemaPath, 'utf8')
  
  guard.guardSchemaChange(newContent).then(result => {
    if (result.allowed) {
      console.log('✅ Schema değişikliği onaylandı')
      process.exit(0)
    } else {
      console.log('❌ Schema değişikliği reddedildi')
      process.exit(1)
    }
  })
}

module.exports = SchemaGuard
