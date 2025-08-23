 'use client'

import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  IconButton,
  MenuItem
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

const EditableField = ({ 
  label, 
  value: initialValue, 
  type = "text", 
  options = [], 
  onSave 
}) => {
  const [value, setValue] = useState(initialValue);
  const [editing, setEditing] = useState(false);
  const [hover, setHover] = useState(false);

  const handleSave = () => {
    setEditing(false);
    if (onSave) onSave(value);
  };

  const handleCancel = () => {
    setEditing(false);
    setValue(initialValue);
  };

  return (
    <Box
      display="flex"
      alignItems="center"
      mb={1}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >

      {/* Label */}
      <Typography variant="body2" fontWeight="bold" sx={{ width: "40%" }}>
        {label}
      </Typography>

      {/* Value / Editor */}
      {editing ? (
        <>
          {type === "select" ? (
            <TextField
              select
              size="small"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              sx={{ minWidth: 180 }}
            >
              {options.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </TextField>
          ) : (
            <TextField
              size="small"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              sx={{ minWidth: 180 }}
            />
          )}
          <IconButton color="success" onClick={handleSave}>
            <CheckIcon fontSize="small" />
          </IconButton>
          <IconButton color="error" onClick={handleCancel}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </>
      ) : (
        <>
          <Typography
            variant="body2"
            color={value ? "text.secondary" : "text.disabled"}
            sx={{ flex: 1 }}
          >
            {value || "—"}
          </Typography>
          {hover && (
            <IconButton size="small" onClick={() => setEditing(true)}>
              <EditIcon fontSize="small" />
            </IconButton>
          )}
        </>
      )}
    </Box>
  );
};

export default EditableField;
