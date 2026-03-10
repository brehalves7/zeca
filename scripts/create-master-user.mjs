// Script para criar usuário mestre no Supabase
// Uso: node scripts/create-master-user.mjs

const SUPABASE_URL = 'https://mlewwvfupfwpbtwuxisa.supabase.co'

// ⚠️ Cole aqui a SERVICE_ROLE_KEY (Project Settings > API > service_role secret)
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!SERVICE_ROLE_KEY) {
  console.error('❌ SERVICE_ROLE_KEY não definida.')
  console.error('   Execute: $env:SUPABASE_SERVICE_ROLE_KEY="sua_key_aqui"; node scripts/create-master-user.mjs')
  process.exit(1)
}

const email = 'breh_sjp@hotmail.com'
const password = '12345678'

async function createUser() {
  console.log(`\n🔐 Criando usuário mestre: ${email}\n`)

  // 1. Criar usuário via Admin API
  const createRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({
      email,
      password,
      email_confirm: true, // confirma e-mail automaticamente
      user_metadata: { role: 'master' },
    }),
  })

  const createData = await createRes.json()

  if (!createRes.ok) {
    if (createData.msg?.includes('already') || createData.message?.includes('already')) {
      console.log('⚠️  Usuário já existe. Atualizando senha...')
      
      // Buscar ID do usuário existente
      const listRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?email=${encodeURIComponent(email)}`, {
        headers: {
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        },
      })
      const listData = await listRes.json()
      const userId = listData.users?.[0]?.id

      if (!userId) {
        console.error('❌ Não foi possível encontrar o usuário.')
        return
      }

      // Atualizar senha
      const updateRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ password, email_confirm: true }),
      })

      if (updateRes.ok) {
        console.log(`✅ Senha atualizada para o usuário: ${email}`)
        return
      } else {
        const err = await updateRes.json()
        console.error('❌ Erro ao atualizar:', err)
        return
      }
    }

    console.error('❌ Erro ao criar usuário:', createData)
    return
  }

  const userId = createData.id
  console.log(`✅ Usuário criado! ID: ${userId}`)

  // 2. Criar perfil na tabela profiles
  const profileRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify({
      id: userId,
      company_name: 'Distribuidora Mestre',
      whatsapp_business_number: '+55 83 99999-9999',
      plan_status: 'pro',
    }),
  })

  if (profileRes.ok || profileRes.status === 201) {
    console.log('✅ Perfil criado na tabela profiles')
  } else {
    const profileErr = await profileRes.text()
    console.warn('⚠️  Aviso ao criar perfil (pode já existir):', profileErr)
  }

  console.log('\n🎉 Usuário mestre configurado com sucesso!')
  console.log(`   E-mail  : ${email}`)
  console.log(`   Senha   : ${password}`)
  console.log(`   Plano   : pro`)
  console.log('\n👉 Acesse: http://localhost:3000/login\n')
}

createUser().catch(console.error)
