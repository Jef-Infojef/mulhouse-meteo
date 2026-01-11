import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { HistoryData, HistoryRecord } from "@/types/weather";

export async function GET() {
  try {
    const now = new Date();
    const day = now.getDate();
    const month = now.getMonth() + 1;

    // Récupérer toutes les données historiques pour ce jour du calendrier
    const records = await prisma.weatherHistory.findMany({
      where: {
        location: "Mulhouse",
        day: day,
        month: month,
      },
      orderBy: {
        year: "desc",
      },
    });

    if (records.length === 0) {
      return NextResponse.json(
        { error: "Aucune donnée historique disponible" },
        { status: 404 }
      );
    }

    // Transformer en format HistoryRecord
    const timeline: HistoryRecord[] = records.map((r) => ({
      year: r.year,
      tempMax: r.tempMax,
      tempMin: r.tempMin,
      weatherCode: r.weatherCode,
    }));

    // Trouver les records
    const sortedByMax = [...timeline].sort((a, b) => b.tempMax - a.tempMax);
    const sortedByMin = [...timeline].sort((a, b) => a.tempMin - b.tempMin);

    // Calculer les moyennes
    const avgTempMax =
      timeline.reduce((sum, r) => sum + r.tempMax, 0) / timeline.length;
    const avgTempMin =
      timeline.reduce((sum, r) => sum + r.tempMin, 0) / timeline.length;

    const historyData: HistoryData = {
      location: "Mulhouse",
      day: `${day.toString().padStart(2, "0")}/${month.toString().padStart(2, "0")}`,
      records: {
        highest: sortedByMax[0] || null,
        lowest: sortedByMin[0] || null,
      },
      averages: {
        tempMax: Math.round(avgTempMax * 10) / 10,
        tempMin: Math.round(avgTempMin * 10) / 10,
      },
      timeline,
      totalYearsAnalyzed: timeline.length,
    };

    return NextResponse.json(historyData);
  } catch (error) {
    console.error("Erreur API historique:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'historique" },
      { status: 500 }
    );
  }
}
