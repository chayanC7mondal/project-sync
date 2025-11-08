import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar, Clock, MapPin, Search, Eye } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

interface HearingSession {
  id: number;
  case_id: number;
  hearing_date: string;
  hearing_time: string;
  case_number: string;
  case_title: string;
  location: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
}

// Dummy upcoming hearings data
const dummyUpcomingHearings: HearingSession[] = [
  {
    id: 6,
    case_id: 106,
    hearing_date: "2025-11-11",
    hearing_time: "09:00 AM",
    case_number: "CR/006/2025",
    case_title: "Burglary case - Commercial property",
    location: "Court Room 2",
    status: "scheduled",
  },
  {
    id: 7,
    case_id: 107,
    hearing_date: "2025-11-11",
    hearing_time: "11:00 AM",
    case_number: "CR/007/2025",
    case_title: "Assault case - Domestic dispute",
    location: "Court Room 1",
    status: "scheduled",
  },
  {
    id: 8,
    case_id: 108,
    hearing_date: "2025-11-11",
    hearing_time: "03:00 PM",
    case_number: "CR/008/2025",
    case_title: "Theft case - Vehicle stolen",
    location: "Court Room 3",
    status: "scheduled",
  },
  {
    id: 9,
    case_id: 109,
    hearing_date: "2025-11-12",
    hearing_time: "10:00 AM",
    case_number: "CR/009/2025",
    case_title: "Fraud case - Online scam",
    location: "Court Room 1",
    status: "scheduled",
  },
  {
    id: 10,
    case_id: 110,
    hearing_date: "2025-11-12",
    hearing_time: "02:00 PM",
    case_number: "CR/010/2025",
    case_title: "Robbery case - Armed robbery at bank",
    location: "Court Room 2",
    status: "scheduled",
  },
  {
    id: 11,
    case_id: 111,
    hearing_date: "2025-11-13",
    hearing_time: "09:30 AM",
    case_number: "CR/011/2025",
    case_title: "Kidnapping case - Missing person found",
    location: "Court Room 1",
    status: "scheduled",
  },
  {
    id: 12,
    case_id: 112,
    hearing_date: "2025-11-13",
    hearing_time: "01:00 PM",
    case_number: "CR/012/2025",
    case_title: "Murder case - Investigation hearing",
    location: "Court Room 3",
    status: "scheduled",
  },
  {
    id: 13,
    case_id: 113,
    hearing_date: "2025-11-14",
    hearing_time: "10:30 AM",
    case_number: "CR/013/2025",
    case_title: "Cybercrime case - Data breach",
    location: "Court Room 2",
    status: "scheduled",
  },
  {
    id: 14,
    case_id: 114,
    hearing_date: "2025-11-14",
    hearing_time: "03:00 PM",
    case_number: "CR/014/2025",
    case_title: "Smuggling case - Border seizure",
    location: "Court Room 1",
    status: "scheduled",
  },
  {
    id: 15,
    case_id: 115,
    hearing_date: "2025-11-15",
    hearing_time: "11:00 AM",
    case_number: "CR/015/2025",
    case_title: "Extortion case - Business threat",
    location: "Court Room 3",
    status: "scheduled",
  },
  {
    id: 16,
    case_id: 116,
    hearing_date: "2025-11-15",
    hearing_time: "02:30 PM",
    case_number: "CR/016/2025",
    case_title: "Drug trafficking case - Major bust",
    location: "Court Room 2",
    status: "scheduled",
  },
  {
    id: 17,
    case_id: 117,
    hearing_date: "2025-11-15",
    hearing_time: "04:00 PM",
    case_number: "CR/017/2025",
    case_title: "Arson case - Property damage",
    location: "Court Room 1",
    status: "scheduled",
  },
];

const UpcomingHearings = () => {
  const navigate = useNavigate();
  const [hearings] = useState<HearingSession[]>(dummyUpcomingHearings);
  const [filteredHearings, setFilteredHearings] = useState<HearingSession[]>(dummyUpcomingHearings);
  const [loading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [daysFilter, setDaysFilter] = useState(7);

  useEffect(() => {
    if (searchTerm) {
      const filtered = hearings.filter(
        (hearing) =>
          hearing.case_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          hearing.case_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          hearing.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredHearings(filtered);
    } else {
      setFilteredHearings(hearings);
    }
  }, [searchTerm, hearings]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      scheduled: "default",
      in_progress: "secondary",
      completed: "outline",
      cancelled: "destructive",
    };
    return (
      <Badge variant={variants[status] || "default"}>
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  const groupByDate = (hearings: HearingSession[]) => {
    const grouped: Record<string, HearingSession[]> = {};
    hearings.forEach((hearing) => {
      if (!grouped[hearing.hearing_date]) {
        grouped[hearing.hearing_date] = [];
      }
      grouped[hearing.hearing_date].push(hearing);
    });
    return grouped;
  };

  const groupedHearings = groupByDate(filteredHearings);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Upcoming Hearings</h1>
          <p className="text-muted-foreground mt-1">
            Next {daysFilter} days schedule
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={daysFilter === 7 ? "default" : "outline"}
            size="sm"
            onClick={() => setDaysFilter(7)}
          >
            7 Days
          </Button>
          <Button
            variant={daysFilter === 14 ? "default" : "outline"}
            size="sm"
            onClick={() => setDaysFilter(14)}
          >
            14 Days
          </Button>
          <Button
            variant={daysFilter === 30 ? "default" : "outline"}
            size="sm"
            onClick={() => setDaysFilter(30)}
          >
            30 Days
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by case number, title, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Hearings by Date */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : Object.keys(groupedHearings).length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No upcoming hearings</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        Object.entries(groupedHearings).map(([date, hearings]) => (
          <Card key={date}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                {new Date(date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                <Badge variant="secondary" className="ml-2">
                  {hearings.length} {hearings.length === 1 ? "Hearing" : "Hearings"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Case Number</TableHead>
                      <TableHead>Case Title</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {hearings.map((hearing) => (
                      <TableRow key={hearing.id}>
                        <TableCell className="font-medium">
                          {hearing.case_number}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {hearing.case_title}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            {hearing.hearing_time}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            {hearing.location}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(hearing.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              navigate(`/liaison/hearings/${hearing.id}`)
                            }
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default UpcomingHearings;
