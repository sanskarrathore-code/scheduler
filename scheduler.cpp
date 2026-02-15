#include "scheduler.h"
#include <sstream>
#include <algorithm>

using namespace std;

static int counter = 0;

void syncId(int id) {
    if (id > counter) counter = id;
}

int nextId() { return ++counter; }

TimeLeft getTimeLeft(time_t deadline) {
    time_t now = time(NULL);
    long diff = (long)difftime(deadline, now);
    if (diff <= 0) return {"Overdue", diff};

    long d = diff / 86400;
    long h = (diff % 86400) / 3600;
    long m = (diff % 3600) / 60;

    string s = "";
    if (d > 0) s += to_string(d) + "d ";
    if (h > 0) s += to_string(h) + "h ";
    if (d == 0 && m > 0) s += to_string(m) + "m ";

    if (s.back() == ' ') s.pop_back();
    s += " left";
    return {s, diff};
}

void sortByUrgency(vector<Assignment>& list) {
    time_t now = time(NULL);
    sort(list.begin(), list.end(), [now](Assignment& a, Assignment& b) {
        return difftime(a.deadline, now) < difftime(b.deadline, now);
    });
}

void sortByWeight(vector<Topic>& topics) {
    sort(topics.begin(), topics.end(), [](Topic& a, Topic& b) {
        return a.weightage > b.weightage;
    });
}

int calcReadiness(vector<Topic>& topics) {
    int total = 0, completed = 0;
    for (int i = 0; i < (int)topics.size(); i++) {
        total += topics[i].weightage;
        if (topics[i].done) completed += topics[i].weightage;
    }
    if (total == 0) return 0;
    return (int)((completed * 100.0) / total + 0.5);
}

time_t makeTime(string date, int h, int m) {
    struct tm t = {};
    // expecting YYYY-MM-DD
    sscanf(date.c_str(), "%d-%d-%d", &t.tm_year, &t.tm_mon, &t.tm_mday);
    t.tm_year -= 1900;
    t.tm_mon -= 1;
    t.tm_hour = h;
    t.tm_min = m;
    t.tm_isdst = -1;
    return mktime(&t);
}

string prettyDate(time_t t) {
    struct tm* info = localtime(&t);
    string months[] = {"Jan","Feb","Mar","Apr","May","Jun",
                       "Jul","Aug","Sep","Oct","Nov","Dec"};
    return months[info->tm_mon] + " " + to_string(info->tm_mday)
           + ", " + to_string(info->tm_year + 1900);
}
