'use client';
import React, { useContext, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  Tabs,
  Tab,
  Collapse,
  IconButton,
  Stack,
  Divider,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import StoreContext from '@/context/StoreContext';
import { Program, Schedule } from '@/models/app-general.model';
import { DayOfWeek } from '@/enums/process-status';
import { observer } from 'mobx-react-lite';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const weeklyDayMap = {
  Sunday: 'Domingo',
  Monday: 'Segunda',
  Tuesday: 'Terça',
  Wednesday: 'Quarta',
  Thursday: 'Quinta',
  Friday: 'Sexta',
  Saturday: 'Sábado',
};
const SchedulePage = () => {
  const store = useContext(StoreContext);
  const [selectedDay, setSelectedDay] = useState(
    new Date().getDay() === 0 ? 6 : new Date().getDay() - 1
  );
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [scheduleData, setScheduleData] = useState<Schedule[]>([]);

  useEffect(() => {
    store.schedule.listItems();
  }, []);

  useEffect(() => {
    const daysOfWeek = Object.keys(DayOfWeek);
    // convert daysOfWeek to map of days
    const dayOfWeek = daysOfWeek[selectedDay];
    const scheduleList = store.schedule.itemList
      .filter((item) => item.dayOfWeek === dayOfWeek)
      .sort((a, b) => a.startTimeInMilliseconds - b.startTimeInMilliseconds);

    // for each schedule find the program and add to schedule

    if (store.program.itemList.length === 0) {
      store.program.listItems();
      return;
    }
    const scheduleData = scheduleList.map((schedule) => {
      const program = store.program.itemList.find(
        (program) => program.id === schedule.programId
      );
      return { ...schedule, program };
    });

    setScheduleData(scheduleData);
  }, [
    store.schedule.itemList,
    store.schedule.itemList.length,
    selectedDay,
    store.program.itemList,
    store.program.itemList.length,
  ]);

  const handleDayChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedDay(newValue);
    setExpandedIndex(null);
  };

  const handleExpandClick = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const renderProgramDetail = (item: Program) => {
    return (
      <Box sx={{ mt: 1 }}>
        <Typography variant='body2'>{item.description}</Typography>
      </Box>
    );
  };

  return (
    <Box>
      <Typography variant='h4' gutterBottom>
        Nossa programação
      </Typography>
      <Divider />
      <Box sx={{ mt: 2 }}>
        <Tabs
          value={selectedDay}
          onChange={handleDayChange}
          aria-label='Weekday Tabs'>
          {Object.keys(DayOfWeek)
            .filter((key) => isNaN(Number(key)))
            .map((day) => (
              <Tab
                key={day}
                label={weeklyDayMap[day as keyof typeof weeklyDayMap]}
              />
            ))}
        </Tabs>
        <Card elevation={0}>
          <CardContent>
            <List>
              {scheduleData.map((item, index) => (
                <ListItem divider key={item.id} sx={{ width: '100%' }}>
                  <Stack direction={'column'} flex={1} alignContent={'start'}>
                    <Stack
                      direction='row'
                      spacing={2}
                      alignItems={'center'}
                      justifyContent={'space-between'}>
                      <Stack direction='row' spacing={2} alignItems={'center'}>
                        <ListItemText primary={`${item.startTime}`} />
                        <ListItemText primary={`${item.program?.name}`} />
                      </Stack>
                      <Stack direction='row' spacing={2} alignItems={'center'}>
                        <IconButton
                          onClick={() => handleExpandClick(index)}
                          aria-expanded={expandedIndex === index}
                          aria-label='show more'>
                          {expandedIndex === index ? (
                            <ExpandLessIcon />
                          ) : (
                            <ExpandMoreIcon />
                          )}
                        </IconButton>
                      </Stack>
                    </Stack>
                    <Collapse
                      in={expandedIndex === index}
                      timeout='auto'
                      unmountOnExit>
                      <Box sx={{ mt: 1, p: 1 }}>
                        {renderProgramDetail(item.program!)}{' '}
                      </Box>
                    </Collapse>
                  </Stack>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default observer(SchedulePage);
