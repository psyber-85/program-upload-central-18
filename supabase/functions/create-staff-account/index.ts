import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateStaffRequest {
  name: string
  email: string
  password: string
  role: 'admin' | 'staff'
  businessArm: 'Training' | 'Solutions'
  joinDate: string
  salaryBase?: number
  epfRate?: number
  socsoRate?: number
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Verify the requesting user is an admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user: requestingUser }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !requestingUser) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if requesting user is admin
    const { data: roleData } = await supabaseAdmin
      .from('sp_user_roles')
      .select('role')
      .eq('user_id', requestingUser.id)
      .single()

    if (!roleData || roleData.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Only admins can create staff accounts' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const body: CreateStaffRequest = await req.json()
    const { name, email, password, role, businessArm, joinDate, salaryBase, epfRate, socsoRate } = body

    // Validate required fields
    if (!name || !email || !password || !role || !businessArm || !joinDate) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: name, email, password, role, businessArm, joinDate' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Creating staff account for: ${email}`)

    // Step 1: Create auth user using Admin API
    const { data: authData, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: { name },
    })

    if (createUserError) {
      console.error('Error creating auth user:', createUserError.message)
      return new Response(
        JSON.stringify({ error: `Failed to create user: ${createUserError.message}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const newUserId = authData.user.id
    console.log(`Auth user created with ID: ${newUserId}`)

    // Step 2: Create staff profile
    const { error: profileError } = await supabaseAdmin
      .from('sp_staff_profiles')
      .insert({
        id: newUserId,
        name,
        email,
        business_arm: businessArm,
        join_date: joinDate,
        is_active: true,
        salary_base: salaryBase ?? 0,
        epf_rate: epfRate ?? 11,
        socso_rate: socsoRate ?? 2,
      })

    if (profileError) {
      console.error('Error creating profile:', profileError.message)
      // Rollback: delete the auth user
      await supabaseAdmin.auth.admin.deleteUser(newUserId)
      return new Response(
        JSON.stringify({ error: `Failed to create profile: ${profileError.message}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Staff profile created')

    // Step 3: Create user role
    const { error: roleError } = await supabaseAdmin
      .from('sp_user_roles')
      .insert({
        user_id: newUserId,
        role: role,
      })

    if (roleError) {
      console.error('Error creating role:', roleError.message)
      // Continue anyway, profile was created
    } else {
      console.log('User role created')
    }

    // Step 4: Initialize leave balance for current year
    const currentYear = new Date().getFullYear()
    const { error: leaveError } = await supabaseAdmin
      .from('sp_leave_balances')
      .insert({
        user_id: newUserId,
        year: currentYear,
        al_total: 14,
        al_used: 0,
        al_carry_forward: 0,
        sl_total: 10,
        sl_used: 0,
      })

    if (leaveError) {
      console.error('Error creating leave balance:', leaveError.message)
    } else {
      console.log('Leave balance initialized')
    }

    // Step 5: Initialize training entitlement
    const joinDateObj = new Date(joinDate)
    const eligibleFrom = new Date(joinDateObj)
    eligibleFrom.setFullYear(eligibleFrom.getFullYear() + 1)

    const { error: trainingError } = await supabaseAdmin
      .from('sp_training_entitlements')
      .insert({
        user_id: newUserId,
        annual_amount: 1500,
        used_amount: 0,
        eligible_from: eligibleFrom.toISOString().split('T')[0],
        override_eligible: false,
      })

    if (trainingError) {
      console.error('Error creating training entitlement:', trainingError.message)
    } else {
      console.log('Training entitlement initialized')
    }

    console.log(`Staff account created successfully for: ${email}`)

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: newUserId,
          name,
          email,
          role,
          businessArm,
          joinDate,
          isActive: true,
          salaryBase: salaryBase ?? 0,
          epfRate: epfRate ?? 11,
          socsoRate: socsoRate ?? 2,
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
