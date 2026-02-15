#ifndef SCHEDULER_H
#define SCHEDULER_H

#include "types.h"

struct TimeLeft {
    string text;
    long secs;
};

TimeLeft getTimeLeft(time_t deadline);
void sortByUrgency(vector<Assignment>& list);
void sortByWeight(vector<Topic>& topics);
int calcReadiness(vector<Topic>& topics);
time_t makeTime(string date, int h, int m);
string prettyDate(time_t t);
int nextId();
void syncId(int id);

#endif
