"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TeamAvatar } from "@/components/mpl/match-schedule";
import { Star, Medal, AlertCircle, Loader2 } from "lucide-react";
import { GlobalLeaderboardUser } from "@/actions/mpl/predictions";
import { RemainingMatchSlim, TeamStanding } from "@/actions/mpl/standings";
import { computeChances } from "@/components/mpl/standing-tabs";
import { Team } from "@/lib/generated/prisma/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { setFavoriteTeam } from "@/actions/user/favorite-team";
import { useTransition } from "react";

function formatPct(pct: number) {
  if (pct === 100) return "100%";
  if (pct === 0) return "0%";
  if (pct > 99) return ">99%";
  if (pct < 1) return "<1%";
  return `${Math.round(pct)}%`;
}

export function FavoriteTeamCard({ favoriteTeam, standings, remainingMatches, teams }: { favoriteTeam: Team | null, standings?: TeamStanding[], remainingMatches?: RemainingMatchSlim[], teams: { id: number, name: string, logo: string | null }[] }) {
  const [isPending, startTransition] = useTransition();

  const handleSelectTeam = (val: string | null) => {
    if (!val) return;
    startTransition(async () => {
      await setFavoriteTeam(val === "0" ? null : Number(val));
    });
  };

  if (!favoriteTeam) {
    return (
      <Card className="bg-linear-to-br from-primary/5 via-card to-card border-primary/20 overflow-hidden relative">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" /> My Favorite Team
          </CardTitle>
          <CardDescription className="text-xs">
            Follow a team to get quick updates on their form and playoff chances.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mt-2">
            <Select onValueChange={handleSelectTeam} disabled={isPending}>
              <SelectTrigger className="w-[200px]">
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <SelectValue placeholder="+ Choose Favorite Team" />}
              </SelectTrigger>
              <SelectContent>
                {teams.map(t => (
                  <SelectItem key={t.id} value={String(t.id)}>
                    <div className="flex items-center gap-2">
                      <TeamAvatar name={t.name} logo={t.logo} size="small" color="left" />
                      {t.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    );
  }

  const favoriteStanding = standings?.find(s => s.teamId === favoriteTeam.id);
  let favoriteChances = undefined;
  if (standings && remainingMatches) {
    const withChances = computeChances(standings, remainingMatches);
    favoriteChances = withChances.find(c => c.teamId === favoriteTeam.id);
  }

  return (
    <Card className="bg-linear-to-br from-primary/10 via-card to-card border-primary/20 overflow-hidden relative group">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /> My Team
          </div>
          <Select onValueChange={handleSelectTeam} disabled={isPending}>
            <SelectTrigger className="h-6 w-fit border-none shadow-none focus:ring-0 bg-transparent text-xs p-0 m-0 hidden group-hover:flex">
              {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Change"}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0" className="text-red-500">Remove Favorite</SelectItem>
              {teams.map(t => (
                <SelectItem key={t.id} value={String(t.id)}>
                  <div className="flex items-center gap-2">
                    <TeamAvatar name={t.name} logo={t.logo} size="small" color="left" />
                    {t.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <TeamAvatar name={favoriteTeam.name} logo={favoriteTeam.logo} color="left" size="large" />
          <div className="flex-1">
            <h3 className="text-lg font-black leading-tight uppercase">{favoriteTeam.name}</h3>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider">
                {favoriteTeam.group}
              </Badge>
              {favoriteStanding && (
                <Badge variant="outline" className="text-[10px] font-bold tracking-wider border-primary/20 text-primary">
                  Rank #{favoriteStanding.rank}
                </Badge>
              )}
            </div>
            {favoriteChances && (
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {favoriteChances.upperBracketPct === 100 ? (
                  <Badge className="bg-green-500 hover:bg-green-600 text-[10px] font-bold uppercase tracking-wider text-white">Qualified to Upper Bracket</Badge>
                ) : favoriteChances.playoffPct === 100 ? (
                  <Badge className="bg-blue-500 hover:bg-blue-600 text-[10px] font-bold uppercase tracking-wider text-white">Qualified to Playoffs</Badge>
                ) : favoriteChances.playoffPct === 0 ? (
                  <Badge variant="destructive" className="text-[10px] font-bold uppercase tracking-wider">Eliminated</Badge>
                ) : (
                  <>
                    <div className="text-[10px] font-semibold text-muted-foreground bg-muted/80 px-2 py-0.5 rounded-sm">
                      Playoff: <span className="text-foreground font-bold">{formatPct(favoriteChances.playoffPct)}</span>
                    </div>
                    <div className="text-[10px] font-semibold text-muted-foreground bg-muted/80 px-2 py-0.5 rounded-sm">
                      Upper: <span className="text-foreground font-bold">{formatPct(favoriteChances.upperBracketPct)}</span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          {favoriteStanding && (
            <div className="text-right flex flex-col justify-center border-l pl-4 border-border/50">
               <div className="text-2xl font-black tabular-nums text-red-600 dark:text-red-500 leading-none mb-1">
                 {favoriteStanding.matchPoints} <span className="text-[10px] text-muted-foreground uppercase font-bold">Pts</span>
               </div>
               <div className="text-xs font-bold text-muted-foreground">
                 {favoriteStanding.matchWins}W - {favoriteStanding.matchLosses}L
               </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function GlobalLeaderboardCard({ leaderboard }: { leaderboard: GlobalLeaderboardUser[] }) {
  return (
    <Card className="flex-1">
      <CardHeader className="pb-4">
        <CardTitle className="text-sm flex items-center gap-2">
          <Medal className="w-4 h-4 text-primary" /> Top Predictors
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5">
        <div className="space-y-4">
          {leaderboard.map((user, index) => (
            <div key={user.userId} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-black ${
                  index === 0 ? "bg-yellow-500/20 text-yellow-600 dark:text-yellow-500" :
                  index === 1 ? "bg-slate-300/30 text-slate-500 dark:text-slate-400" :
                  index === 2 ? "bg-amber-700/20 text-amber-700 dark:text-amber-600" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {index + 1}
                </div>
                <div className="text-sm font-bold leading-tight truncate max-w-[120px]">
                  {user.userName}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-black text-primary">{user.stats.accuracy.toFixed(1)}%</div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase">{user.stats.exactScores} Exact</div>
              </div>
            </div>
          ))}
          {leaderboard.length === 0 && (
            <div className="text-xs text-muted-foreground text-center py-2">
              No predictions yet.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function ClinchFeedCard({ standings, remainingMatches }: { standings: TeamStanding[], remainingMatches: RemainingMatchSlim[] }) {
  const withChances = computeChances(standings, remainingMatches);
  
  // Find teams that have clinched playoff (100%) or eliminated (0%)
  const updates = withChances.filter(t => t.playoffPct === 100 || t.playoffPct === 0).map(t => {
    return {
      teamId: t.teamId,
      teamName: t.teamName,
      logo: t.logo,
      status: t.playoffPct === 100 ? "QUALIFIED" : "ELIMINATED",
      isUb: t.upperBracketPct === 100,
    };
  });

  if (updates.length === 0) return null; // Only show if there are actual clinches/eliminations

  return (
    <Card className="border-red-500/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500" /> Playoff Updates
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {updates.map((update) => (
            <div key={update.teamId} className="flex items-center gap-3">
              <TeamAvatar name={update.teamName} logo={update.logo} color="left" size="small" />
              <div className="text-sm">
                <span className="font-bold">{update.teamName}</span> has been{" "}
                {update.status === "QUALIFIED" ? (
                  <span className="text-green-500 font-bold uppercase tracking-tight">QUALIFIED to {update.isUb ? "UPPER BRACKET" : "PLAYOFFS"}!</span>
                ) : (
                  <span className="text-red-500 font-bold uppercase tracking-tight">ELIMINATED.</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
