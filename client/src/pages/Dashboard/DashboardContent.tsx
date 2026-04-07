import React from "react";
import { Box, Paper, Typography } from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { domain } from "../../components/utils/utils";
import CustomCardLoader from "../../components/loader/CustomLoader";

const fetchNoteCount = async () => {
  const token = localStorage.getItem("token");

  const res = await axios.get(`${domain}/notes/count`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data.count;
};

const fetchMyNoteCount = async () => {
  const token = localStorage.getItem("token");

  const res = await axios.get(`${domain}/mynotes/count`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data.count;
};

const fetchDeletedNoteCount = async () => {
  const token = localStorage.getItem("token");

  const res = await axios.get(`${domain}/delnotes/count`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data.count;
};

const DashboardCard = ({
  title,
  count,
  icon,
}: {
  title: string;
  count: number;
  icon: React.ReactNode;
}) => (
  <Paper
    elevation={3}
    sx={{
      flex: 1,
      minWidth: 200,
      padding: 3,
      borderRadius: 2,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    }}
  >
    <Box>
      <Typography variant="h6">{title}</Typography>
      <Typography variant="h4">{count}</Typography>
    </Box>
    <Box>{icon}</Box>
  </Paper>
);

const DashboardContent = () => {
  const { data: noteCount = 0, isLoading: isLoadingNote } = useQuery({
    queryKey: ["noteCount"],
    queryFn: fetchNoteCount,
  });

  const { data: myNoteCount = 0, isLoading: isLoadingMyNote } = useQuery({
    queryKey: ["myNoteCount"],
    queryFn: fetchMyNoteCount,
  });

  const { data: deletedNoteCount = 0, isLoading: isLoadingDeletedNote } =
    useQuery({
      queryKey: ["deletedNoteCount"],
      queryFn: fetchDeletedNoteCount,
    });

  const isLoading = isLoadingNote || isLoadingMyNote || isLoadingDeletedNote;

  if (isLoading) {
    return <CustomCardLoader />;
  }

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Box
        sx={{
          display: "flex",
          gap: 3,
          flexWrap: "wrap",
          justifyContent: "flex-start",
        }}
      >
        <DashboardCard
          title="All Notes"
          count={noteCount}
          icon={<DescriptionIcon fontSize="large" color="primary" />}
        />
        <DashboardCard
          title="My Notes"
          count={myNoteCount}
          icon={<NoteAddIcon fontSize="large" color="secondary" />}
        />
        <DashboardCard
          title="Deleted Notes"
          count={deletedNoteCount}
          icon={<DeleteOutlineIcon fontSize="large" color="error" />}
        />
      </Box>
    </Box>
  );
};

export default DashboardContent;
