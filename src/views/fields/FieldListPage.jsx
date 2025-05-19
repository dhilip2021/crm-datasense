import React, { useEffect } from "react";

import { Box, CardHeader, Grid, MenuItem, TextField } from "@mui/material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import CardActionArea from "@mui/material/CardActionArea";

import OptionsMenu from '@core/components/option-menu'

const FieldListPage = (props) => {
  const { fieldDataList, editFlag, handleDelete, handleAction } = props;

  console.log(fieldDataList,"<<< FILED LISSSSS")

  return (
    <Box mt={4}>
      <Grid container spacing={2}>
        {Array.isArray(fieldDataList) && fieldDataList?.map((data, index) => (
          <Grid item xs={3} key={index}>
            <Card>
               
              <CardActionArea
                sx={{
                  height: "100%",
                  "&[data-active]": {
                    backgroundColor: "action.selected",
                    "&:hover": {
                      backgroundColor: "action.selectedHover",
                    },
                  },
                }}
              >
                <CardHeader
                                  title={
                                    <Typography variant="h5" sx={{ fontSize: '14px' }}>
                                      {data.label}
                                    </Typography>
                                  }
                                  sx={{
                                    fontSize:"14px"
                                  }}
                                  action={
                                    <OptionsMenu
                                      iconClassName='text-textPrimary'
                                      options={['Edit', 'Delete']}
                                      onOptionClick={(option, e) => handleAction(option, data, index)}
                                    />
                                  }
                                />
                <CardContent sx={{ height: "100%" }}>
                    {
                        editFlag && 
                        <Box sx={{ float: "inline-end" }}>
                         <i className="ri-close-line" onClick={()=>handleDelete(index)}></i>   
                  </Box>
                    }


  {
                    data?.type === "text" && 
                    <Typography variant="h5" component="div">
                    <TextField
                      autoComplete="off"
                      fullWidth
                      id="outlined-basic"
                      label={`${data?.label} ${data?.mandatory==="yes" ? `*`  : ""}`}
                      variant="outlined"
                      type="text"
                      name={data?.slug_label}
                      size="small"
                      value=""
                      sx={{
                        ".MuiFormHelperText-root": {
                          ml: 0,
                        },
                      }}
                    ></TextField>
                  </Typography>
                  }

                  {
                    data?.type === "select" && 
                    <Typography variant="h5" component="div">
                    <TextField
                      select
                      autoComplete="off"
                      fullWidth
                      id="outlined-basic"
                      label={`${data?.label} ${data?.mandatory==="yes" ? `*`  : ""}`}
                      variant="outlined"
                      type="text"
                      name={data?.slug_label}
                      size="small"
                      value=""
                      sx={{
                        ".MuiFormHelperText-root": {
                          ml: 0,
                        },
                      }}
                    >
                      {data.items?.map((item, ids) => (
                                              <MenuItem value={item} key={ids}>
                                                {item?.menu_value}
                                              </MenuItem>
                                            ))}

                    </TextField>
                  </Typography>
                  }
                  





                  <Typography mt={1} variant="body2" color="text.secondary">
                    slug-name1 : {data?.slug_label}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}

      </Grid>
    </Box>
  );
};

export default FieldListPage;
