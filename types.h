#ifndef TYPES_H
#define TYPES_H

#include <string>
#include <vector>
#include <ctime>

using namespace std;

struct Topic {
    string name;
    int weightage;
    bool done;
};

struct Assignment {
    int id;
    string name;
    time_t deadline;
    int completion;
};

struct Exam {
    int id;
    string subject;
    time_t date;
    vector<Topic> topics;
};

#endif
