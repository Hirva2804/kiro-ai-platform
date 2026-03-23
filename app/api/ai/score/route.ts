import { NextRequest, NextResponse } from 'next/server'
import { extractSignals, computeScore, generateScoreExplanation, detectIntent } from '@/lib/ai/explainableScoring'
import { computeNextBestAction } from '@/lib/ai/nextBestAction'

export async function POST(request: NextRequest) {
  try {
    const { lead, pageVisits } = await request.json()

    const leadWithVisits = { ...lead, pageVisits: pageVisits || [] }
    const signals = extractSignals(leadWithVisits)
    const { aiScore, conversionProbability, confidence, category } = computeScore(signals)
    const intentLevel = detectIntent(pageVisits || [])
    const { explanation, topReasons } = await generateScoreExplanation(lead, signals, aiScore)
    const nextBestAction = computeNextBestAction({ ...lead, aiScore, intentLevel })

    return NextResponse.json({
      aiScore,
      conversionProbability,
      confidence,
      category,
      signals,
      explanation,
      topReasons,
      intentLevel,
      nextBestAction
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}