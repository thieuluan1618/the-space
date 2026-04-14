import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Email address is required.' },
        { status: 400 }
      )
    }

    const trimmed = email.trim().toLowerCase()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmed)) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email address.' },
        { status: 400 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { error } = await supabase
      .from('subscribers')
      .insert([{ email: trimmed }])

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { success: false, message: 'This email is already subscribed.' },
          { status: 409 }
        )
      }
      console.error('Error inserting subscriber:', error)
      return NextResponse.json(
        { success: false, message: 'Something went wrong. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, message: 'You are now subscribed for collection updates.' },
      { status: 201 }
    )
  } catch (err) {
    console.error('Unexpected error in subscribe route:', err)
    return NextResponse.json(
      { success: false, message: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}