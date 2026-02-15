#include "storage.h"
#include <fstream>

using namespace std;

void saveAll(string fname, vector<Assignment>& assignments, vector<Exam>& exams) {
    ofstream out(fname);
    if (!out) return;

    out << assignments.size() << endl;
    for (int i = 0; i < (int)assignments.size(); i++) {
        out << assignments[i].id << "\n";
        out << assignments[i].name << "\n";
        out << assignments[i].deadline << "\n";
        out << assignments[i].completion << "\n";
        out << "---" << endl;
    }

    out << exams.size() << endl;
    for (int i = 0; i < (int)exams.size(); i++) {
        out << exams[i].id << "\n";
        out << exams[i].subject << "\n";
        out << exams[i].date << "\n";
        out << exams[i].topics.size() << "\n";
        for (int j = 0; j < (int)exams[i].topics.size(); j++) {
            out << exams[i].topics[j].name << "\n";
            out << exams[i].topics[j].weightage << "\n";
            out << (exams[i].topics[j].done ? 1 : 0) << "\n";
        }
        out << "---" << endl;
    }
    out.close();
}

bool loadAll(string fname, vector<Assignment>& assignments, vector<Exam>& exams) {
    ifstream in(fname);
    if (!in) return false;

    string line;
    assignments.clear();
    exams.clear();

    int nAssign;
    in >> nAssign;
    in.ignore();

    for (int i = 0; i < nAssign; i++) {
        Assignment a;
        in >> a.id; in.ignore();
        getline(in, a.name);
        in >> a.deadline >> a.completion;
        in.ignore();
        getline(in, line); // ---
        assignments.push_back(a);
    }

    int nExams;
    in >> nExams;
    in.ignore();

    for (int i = 0; i < nExams; i++) {
        Exam e;
        in >> e.id; in.ignore();
        getline(in, e.subject);
        in >> e.date;
        int nTopics;
        in >> nTopics;
        in.ignore();
        for (int j = 0; j < nTopics; j++) {
            Topic t;
            getline(in, t.name);
            int d;
            in >> t.weightage >> d;
            t.done = (d == 1);
            in.ignore();
            e.topics.push_back(t);
        }
        getline(in, line); // ---
        exams.push_back(e);
    }
    in.close();
    return true;
}
