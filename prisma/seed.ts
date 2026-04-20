import prisma from "@/lib/prisma";
import { MatchFormat, MatchGroup } from "@/lib/generated/prisma/enums";

const teams = [
  { id: 1, name: "BTR",  logo: "https://res.cloudinary.com/dank44k6v/image/upload/q_auto/f_auto/v1776310285/btr_kvg8sh.png",  group: MatchGroup.MPLID },
  { id: 2, name: "AE",   logo: "https://res.cloudinary.com/dank44k6v/image/upload/q_auto/f_auto/v1776310286/alter-ego_tmmuef.png", group: MatchGroup.MPLID },
  { id: 3, name: "NAVI", logo: "https://res.cloudinary.com/dank44k6v/image/upload/q_auto/f_auto/v1776311090/navi_xprp7n.png",  group: MatchGroup.MPLID },
  { id: 4, name: "RRQ",  logo: "https://res.cloudinary.com/dank44k6v/image/upload/q_auto/f_auto/v1776311091/rrq_bigfyi.png",   group: MatchGroup.MPLID },
  { id: 5, name: "EVOS", logo: "https://res.cloudinary.com/dank44k6v/image/upload/q_auto/f_auto/v1776310295/evos_httsxo.png",  group: MatchGroup.MPLID },
  { id: 6, name: "GEEK", logo: "https://res.cloudinary.com/dank44k6v/image/upload/q_auto/f_auto/v1776311091/geek-fam_o0v1za.png", group: MatchGroup.MPLID },
  { id: 7, name: "ONIC", logo: "https://res.cloudinary.com/dank44k6v/image/upload/q_auto/f_auto/v1776311091/onic_koqooc.png",  group: MatchGroup.MPLID },
  { id: 8, name: "TLID", logo: "https://res.cloudinary.com/dank44k6v/image/upload/q_auto/f_auto/v1776311092/liquid_mvr7da.png", group: MatchGroup.MPLID },
  { id: 9, name: "DEWA", logo: "https://res.cloudinary.com/dank44k6v/image/upload/q_auto/f_auto/v1776310286/dewa_wosdew.png",  group: MatchGroup.MPLID },
];

const matches = [
  // Week 1
  { id:  1, week: 1, day: 1, date: new Date("2026-03-27"), teamAId: 1, teamBId: 2, format: "BO3", matchNo: 1, teamAResult: 2,    teamBResult: 1    },
  { id:  2, week: 1, day: 1, date: new Date("2026-03-27"), teamAId: 3, teamBId: 4, format: "BO3", matchNo: 2, teamAResult: 2,    teamBResult: 0    },
  { id:  3, week: 1, day: 2, date: new Date("2026-03-28"), teamAId: 5, teamBId: 6, format: "BO3", matchNo: 1, teamAResult: 2,    teamBResult: 0    },
  { id:  4, week: 1, day: 2, date: new Date("2026-03-28"), teamAId: 2, teamBId: 7, format: "BO3", matchNo: 2, teamAResult: 0,    teamBResult: 2    },
  { id:  5, week: 1, day: 2, date: new Date("2026-03-28"), teamAId: 8, teamBId: 3, format: "BO3", matchNo: 3, teamAResult: 2,    teamBResult: 1    },
  { id:  6, week: 1, day: 3, date: new Date("2026-03-29"), teamAId: 9, teamBId: 1, format: "BO3", matchNo: 1, teamAResult: 2,    teamBResult: 0    },
  { id:  7, week: 1, day: 3, date: new Date("2026-03-29"), teamAId: 5, teamBId: 8, format: "BO3", matchNo: 2, teamAResult: 0,    teamBResult: 2    },
  { id:  8, week: 1, day: 3, date: new Date("2026-03-29"), teamAId: 4, teamBId: 7, format: "BO3", matchNo: 3, teamAResult: 0,    teamBResult: 2    },
  // Week 2
  { id:  9, week: 2, day: 1, date: new Date("2026-04-03"), teamAId: 7, teamBId: 6, format: "BO3", matchNo: 1, teamAResult: 2,    teamBResult: 0    },
  { id: 10, week: 2, day: 1, date: new Date("2026-04-03"), teamAId: 9, teamBId: 3, format: "BO3", matchNo: 2, teamAResult: 2,    teamBResult: 0    },
  { id: 11, week: 2, day: 2, date: new Date("2026-04-04"), teamAId: 6, teamBId: 1, format: "BO3", matchNo: 1, teamAResult: 2,    teamBResult: 0    },
  { id: 12, week: 2, day: 2, date: new Date("2026-04-04"), teamAId: 2, teamBId: 5, format: "BO3", matchNo: 2, teamAResult: 2,    teamBResult: 1    },
  { id: 13, week: 2, day: 2, date: new Date("2026-04-04"), teamAId: 8, teamBId: 9, format: "BO3", matchNo: 3, teamAResult: 2,    teamBResult: 1    },
  { id: 14, week: 2, day: 3, date: new Date("2026-04-05"), teamAId: 3, teamBId: 2, format: "BO3", matchNo: 1, teamAResult: 1,    teamBResult: 2    },
  { id: 15, week: 2, day: 3, date: new Date("2026-04-05"), teamAId: 4, teamBId: 8, format: "BO3", matchNo: 2, teamAResult: 0,    teamBResult: 2    },
  { id: 16, week: 2, day: 3, date: new Date("2026-04-05"), teamAId: 1, teamBId: 5, format: "BO3", matchNo: 3, teamAResult: 2,    teamBResult: 1    },
  // Week 3
  { id: 17, week: 3, day: 1, date: new Date("2026-04-10"), teamAId: 7, teamBId: 9, format: "BO3", matchNo: 1, teamAResult: 2,    teamBResult: 1    },
  { id: 18, week: 3, day: 1, date: new Date("2026-04-10"), teamAId: 3, teamBId: 5, format: "BO3", matchNo: 2, teamAResult: 0,    teamBResult: 2    },
  { id: 19, week: 3, day: 2, date: new Date("2026-04-11"), teamAId: 8, teamBId: 6, format: "BO3", matchNo: 1, teamAResult: 0,    teamBResult: 2    },
  { id: 20, week: 3, day: 2, date: new Date("2026-04-11"), teamAId: 7, teamBId: 1, format: "BO3", matchNo: 2, teamAResult: 1,    teamBResult: 2    },
  { id: 21, week: 3, day: 2, date: new Date("2026-04-11"), teamAId: 4, teamBId: 2, format: "BO3", matchNo: 3, teamAResult: 1,    teamBResult: 2    },
  { id: 22, week: 3, day: 3, date: new Date("2026-04-12"), teamAId: 1, teamBId: 3, format: "BO3", matchNo: 1, teamAResult: 1,    teamBResult: 2    },
  { id: 23, week: 3, day: 3, date: new Date("2026-04-12"), teamAId: 6, teamBId: 4, format: "BO3", matchNo: 2, teamAResult: 2,    teamBResult: 1    },
  { id: 24, week: 3, day: 3, date: new Date("2026-04-12"), teamAId: 2, teamBId: 9, format: "BO3", matchNo: 3, teamAResult: 0,    teamBResult: 2    },
  // Week 4
  { id: 25, week: 4, day: 1, date: new Date("2026-04-17"), teamAId: 3, teamBId: 7, format: "BO3", matchNo: 1, teamAResult: 0,    teamBResult: 2    },
  { id: 26, week: 4, day: 1, date: new Date("2026-04-17"), teamAId: 5, teamBId: 9, format: "BO3", matchNo: 2, teamAResult: 2,    teamBResult: 0    },
  { id: 27, week: 4, day: 2, date: new Date("2026-04-18"), teamAId: 8, teamBId: 1, format: "BO3", matchNo: 1, teamAResult: 1,    teamBResult: 2    },
  { id: 28, week: 4, day: 2, date: new Date("2026-04-18"), teamAId: 4, teamBId: 5, format: "BO3", matchNo: 2, teamAResult: 0,    teamBResult: 2    },
  { id: 29, week: 4, day: 2, date: new Date("2026-04-18"), teamAId: 6, teamBId: 2, format: "BO3", matchNo: 3, teamAResult: 1,    teamBResult: 2    },
  { id: 30, week: 4, day: 3, date: new Date("2026-04-19"), teamAId: 7, teamBId: 8, format: "BO3", matchNo: 1, teamAResult: 2,    teamBResult: 0    },
  { id: 31, week: 4, day: 3, date: new Date("2026-04-19"), teamAId: 1, teamBId: 4, format: "BO3", matchNo: 2, teamAResult: 2,    teamBResult: 1    },
  { id: 32, week: 4, day: 3, date: new Date("2026-04-19"), teamAId: 9, teamBId: 6, format: "BO3", matchNo: 3, teamAResult: 2,    teamBResult: 0    },
  // Week 5
  { id: 33, week: 5, day: 1, date: new Date("2026-04-24"), teamAId: 6, teamBId: 3, format: "BO3", matchNo: 1, teamAResult: null, teamBResult: null },
  { id: 34, week: 5, day: 1, date: new Date("2026-04-24"), teamAId: 5, teamBId: 7, format: "BO3", matchNo: 2, teamAResult: null, teamBResult: null },
  { id: 35, week: 5, day: 2, date: new Date("2026-04-25"), teamAId: 9, teamBId: 4, format: "BO3", matchNo: 1, teamAResult: null, teamBResult: null },
  { id: 36, week: 5, day: 2, date: new Date("2026-04-25"), teamAId: 2, teamBId: 8, format: "BO3", matchNo: 2, teamAResult: null, teamBResult: null },
  { id: 37, week: 5, day: 2, date: new Date("2026-04-25"), teamAId: 5, teamBId: 1, format: "BO3", matchNo: 3, teamAResult: null, teamBResult: null },
  { id: 38, week: 5, day: 3, date: new Date("2026-04-26"), teamAId: 2, teamBId: 3, format: "BO3", matchNo: 1, teamAResult: null, teamBResult: null },
  { id: 39, week: 5, day: 3, date: new Date("2026-04-26"), teamAId: 6, teamBId: 7, format: "BO3", matchNo: 2, teamAResult: null, teamBResult: null },
  { id: 40, week: 5, day: 3, date: new Date("2026-04-26"), teamAId: 9, teamBId: 8, format: "BO3", matchNo: 3, teamAResult: null, teamBResult: null },
  // Week 6
  { id: 41, week: 6, day: 1, date: new Date("2026-05-01"), teamAId: 3, teamBId: 9, format: "BO3", matchNo: 1, teamAResult: null, teamBResult: null },
  { id: 42, week: 6, day: 1, date: new Date("2026-05-01"), teamAId: 2, teamBId: 6, format: "BO3", matchNo: 2, teamAResult: null, teamBResult: null },
  { id: 43, week: 6, day: 2, date: new Date("2026-05-02"), teamAId: 5, teamBId: 2, format: "BO3", matchNo: 1, teamAResult: null, teamBResult: null },
  { id: 44, week: 6, day: 2, date: new Date("2026-05-02"), teamAId: 8, teamBId: 7, format: "BO3", matchNo: 2, teamAResult: null, teamBResult: null },
  { id: 45, week: 6, day: 2, date: new Date("2026-05-02"), teamAId: 4, teamBId: 1, format: "BO3", matchNo: 3, teamAResult: null, teamBResult: null },
  { id: 46, week: 6, day: 3, date: new Date("2026-05-03"), teamAId: 3, teamBId: 8, format: "BO3", matchNo: 1, teamAResult: null, teamBResult: null },
  { id: 47, week: 6, day: 3, date: new Date("2026-05-03"), teamAId: 7, teamBId: 4, format: "BO3", matchNo: 2, teamAResult: null, teamBResult: null },
  { id: 48, week: 6, day: 3, date: new Date("2026-05-03"), teamAId: 6, teamBId: 5, format: "BO3", matchNo: 3, teamAResult: null, teamBResult: null },
  // Week 7
  { id: 73, week: 7, day: 1, date: new Date("2026-05-08"), teamAId: 6, teamBId: 9, format: "BO3", matchNo: 1, teamAResult: null, teamBResult: null },
  { id: 74, week: 7, day: 1, date: new Date("2026-05-08"), teamAId: 1, teamBId: 8, format: "BO3", matchNo: 2, teamAResult: null, teamBResult: null },
  { id: 51, week: 7, day: 2, date: new Date("2026-05-09"), teamAId: 9, teamBId: 2, format: "BO3", matchNo: 1, teamAResult: null, teamBResult: null },
  { id: 52, week: 7, day: 2, date: new Date("2026-05-09"), teamAId: 5, teamBId: 4, format: "BO3", matchNo: 2, teamAResult: null, teamBResult: null },
  { id: 53, week: 7, day: 2, date: new Date("2026-05-09"), teamAId: 7, teamBId: 3, format: "BO3", matchNo: 3, teamAResult: null, teamBResult: null },
  { id: 55, week: 7, day: 3, date: new Date("2026-05-10"), teamAId: 3, teamBId: 1, format: "BO3", matchNo: 1, teamAResult: null, teamBResult: null },
  { id: 78, week: 7, day: 3, date: new Date("2026-05-10"), teamAId: 4, teamBId: 6, format: "BO3", matchNo: 2, teamAResult: null, teamBResult: null },
  { id: 80, week: 7, day: 3, date: new Date("2026-05-10"), teamAId: 8, teamBId: 5, format: "BO3", matchNo: 3, teamAResult: null, teamBResult: null },
  // Week 8
  { id: 57, week: 8, day: 1, date: new Date("2026-05-15"), teamAId: 1, teamBId: 6, format: "BO3", matchNo: 1, teamAResult: null, teamBResult: null },
  { id: 58, week: 8, day: 1, date: new Date("2026-05-15"), teamAId: 9, teamBId: 7, format: "BO3", matchNo: 2, teamAResult: null, teamBResult: null },
  { id: 83, week: 8, day: 2, date: new Date("2026-05-16"), teamAId: 5, teamBId: 3, format: "BO3", matchNo: 1, teamAResult: null, teamBResult: null },
  { id: 84, week: 8, day: 2, date: new Date("2026-05-16"), teamAId: 8, teamBId: 4, format: "BO3", matchNo: 2, teamAResult: null, teamBResult: null },
  { id: 61, week: 8, day: 2, date: new Date("2026-05-16"), teamAId: 7, teamBId: 2, format: "BO3", matchNo: 3, teamAResult: null, teamBResult: null },
  { id: 62, week: 8, day: 3, date: new Date("2026-05-17"), teamAId: 9, teamBId: 5, format: "BO3", matchNo: 1, teamAResult: null, teamBResult: null },
  { id: 87, week: 8, day: 3, date: new Date("2026-05-17"), teamAId: 2, teamBId: 1, format: "BO3", matchNo: 2, teamAResult: null, teamBResult: null },
  { id: 88, week: 8, day: 3, date: new Date("2026-05-17"), teamAId: 4, teamBId: 3, format: "BO3", matchNo: 3, teamAResult: null, teamBResult: null },
  // Week 9
  { id: 89, week: 9, day: 1, date: new Date("2026-05-22"), teamAId: 1, teamBId: 9, format: "BO3", matchNo: 1, teamAResult: null, teamBResult: null },
  { id: 90, week: 9, day: 1, date: new Date("2026-05-22"), teamAId: 8, teamBId: 2, format: "BO3", matchNo: 2, teamAResult: null, teamBResult: null },
  { id: 68, week: 9, day: 2, date: new Date("2026-05-23"), teamAId: 2, teamBId: 4, format: "BO3", matchNo: 1, teamAResult: null, teamBResult: null },
  { id: 91, week: 9, day: 2, date: new Date("2026-05-23"), teamAId: 6, teamBId: 8, format: "BO3", matchNo: 2, teamAResult: null, teamBResult: null },
  { id: 93, week: 9, day: 2, date: new Date("2026-05-23"), teamAId: 1, teamBId: 7, format: "BO3", matchNo: 3, teamAResult: null, teamBResult: null },
  { id: 94, week: 9, day: 3, date: new Date("2026-05-24"), teamAId: 4, teamBId: 9, format: "BO3", matchNo: 1, teamAResult: null, teamBResult: null },
  { id: 71, week: 9, day: 3, date: new Date("2026-05-24"), teamAId: 7, teamBId: 5, format: "BO3", matchNo: 2, teamAResult: null, teamBResult: null },
  { id: 72, week: 9, day: 3, date: new Date("2026-05-24"), teamAId: 3, teamBId: 6, format: "BO3", matchNo: 3, teamAResult: null, teamBResult: null },
];

async function main() {
  console.log("Seeding teams...");
  for (const team of teams) {
    await prisma.team.upsert({
      where: { id: team.id },
      update: { name: team.name, logo: team.logo, group: team.group },
      create: { id: team.id, name: team.name, logo: team.logo, group: team.group },
    });
    console.log(`  ✓ ${team.name}`);
  }
  console.log(`\nSeeded ${teams.length} teams successfully.\n`);

  console.log("Seeding matches...");
  for (const match of matches) {
    await prisma.match.upsert({
      where: { id: match.id },
      update: {
        week: match.week,
        day: match.day,
        date: match.date,
        teamAId: match.teamAId,
        teamBId: match.teamBId,
        format: match.format as MatchFormat,
        matchNo: match.matchNo,
        teamAResult: match.teamAResult,
        teamBResult: match.teamBResult,
      },
      create: {
        id: match.id,
        week: match.week,
        day: match.day,
        date: match.date,
        teamAId: match.teamAId,
        teamBId: match.teamBId,
        format: match.format as MatchFormat,
        matchNo: match.matchNo,
        teamAResult: match.teamAResult,
        teamBResult: match.teamBResult,
      },
    });
    console.log(`  ✓ W${match.week}D${match.day} M${match.matchNo}: Team ${match.teamAId} vs Team ${match.teamBId}`);
  }
  console.log(`\nSeeded ${matches.length} matches successfully.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
