#include "types.h"
#include "scheduler.h"
#include "storage.h"
#include <iostream>
#include <string>
#include <limits>

using namespace std;

string SAVEFILE = "scheduler_data.txt";

vector<Assignment> assignments;
vector<Exam> exams;

void flush() {
    cin.clear();
    cin.ignore(10000, '\n');
}

void save() { saveAll(SAVEFILE, assignments, exams); }

void loadSeedData() {
    assignments.push_back({1, "Math Problem Set 4", makeTime("2026-03-01", 23, 59), 40});
    assignments.push_back({2, "Physics Lab Report", makeTime("2026-02-25", 23, 59), 75});
    assignments.push_back({3, "History Essay", makeTime("2026-03-10", 23, 59), 0});

    Exam math;
    math.id = 4; math.subject = "Mathematics"; math.date = makeTime("2026-03-15", 9, 0);
    math.topics.push_back({"Linear Algebra", 8, false});
    math.topics.push_back({"Calculus II", 9, false});
    math.topics.push_back({"Probability", 6, true});
    exams.push_back(math);

    Exam phys;
    phys.id = 5; phys.subject = "Physics"; phys.date = makeTime("2026-03-18", 9, 0);
    phys.topics.push_back({"Thermodynamics", 7, false});
    phys.topics.push_back({"Electromagnetism", 10, false});
    phys.topics.push_back({"Optics", 5, true});
    exams.push_back(phys);

    syncId(5);
}

// find exam by id, returns index or -1
int findExam(int id) {
    for (int i = 0; i < (int)exams.size(); i++)
        if (exams[i].id == id) return i;
    return -1;
}

void viewAssignments() {
    if (assignments.empty()) { cout << "\nNo assignments yet.\n"; return; }

    sortByUrgency(assignments);
    cout << "\n--- Assignments (by urgency) ---\n\n";
    for (int i = 0; i < (int)assignments.size(); i++) {
        auto tl = getTimeLeft(assignments[i].deadline);
        cout << "[" << assignments[i].id << "] " << assignments[i].name << "\n";
        cout << "    Due: " << prettyDate(assignments[i].deadline);
        cout << " | " << tl.text << " | " << assignments[i].completion << "% done\n\n";
    }
}

void addAssignment() {
    string name, date;
    int h, m, comp;

    cout << "\nName: ";
    getline(cin, name);
    if (name.empty()) return;

    cout << "Deadline (YYYY-MM-DD): ";
    getline(cin, date);
    cout << "Hour (0-23): "; cin >> h;
    cout << "Minute (0-59): "; cin >> m;
    cout << "Completion % (0-100): "; cin >> comp;
    flush();

    if (comp < 0) comp = 0;
    if (comp > 100) comp = 100;

    Assignment a;
    a.id = nextId();
    a.name = name;
    a.deadline = makeTime(date, h, m);
    a.completion = comp;
    assignments.push_back(a);
    save();
    cout << "Added '" << name << "'\n";
}

void updateCompletion() {
    if (assignments.empty()) { cout << "\nNothing to update.\n"; return; }

    int id, pct;
    cout << "\nAssignment ID: "; cin >> id;

    for (int i = 0; i < (int)assignments.size(); i++) {
        if (assignments[i].id == id) {
            cout << "Currently at " << assignments[i].completion << "%\n";
            cout << "New %: "; cin >> pct; flush();
            if (pct < 0) pct = 0;
            if (pct > 100) pct = 100;
            assignments[i].completion = pct;
            save();
            cout << "Updated.\n";
            return;
        }
    }
    flush();
    cout << "Not found.\n";
}

void removeAssignment() {
    if (assignments.empty()) { cout << "\nNothing to remove.\n"; return; }

    int id;
    cout << "\nAssignment ID: "; cin >> id; flush();

    for (int i = 0; i < (int)assignments.size(); i++) {
        if (assignments[i].id == id) {
            cout << "Removed '" << assignments[i].name << "'\n";
            assignments.erase(assignments.begin() + i);
            save();
            return;
        }
    }
    cout << "Not found.\n";
}

void viewExams() {
    if (exams.empty()) { cout << "\nNo exams.\n"; return; }

    cout << "\n--- Exams ---\n\n";
    for (int i = 0; i < (int)exams.size(); i++) {
        auto tl = getTimeLeft(exams[i].date);
        int ready = calcReadiness(exams[i].topics);
        cout << "[" << exams[i].id << "] " << exams[i].subject << "\n";
        cout << "    " << prettyDate(exams[i].date) << " | " << tl.text;
        cout << " | Readiness: " << ready << "%\n";

        if (!exams[i].topics.empty()) {
            sortByWeight(exams[i].topics);
            for (int j = 0; j < (int)exams[i].topics.size(); j++) {
                cout << "      " << (exams[i].topics[j].done ? "[x]" : "[ ]");
                cout << " " << exams[i].topics[j].name;
                cout << " (w:" << exams[i].topics[j].weightage << ")\n";
            }
        }
        cout << "\n";
    }
}

void addExam() {
    string subj, date;
    int h, m;

    cout << "\nSubject: ";
    getline(cin, subj);
    if (subj.empty()) return;

    cout << "Date (YYYY-MM-DD): ";
    getline(cin, date);
    cout << "Hour: "; cin >> h;
    cout << "Minute: "; cin >> m;
    flush();

    Exam e;
    e.id = nextId();
    e.subject = subj;
    e.date = makeTime(date, h, m);
    exams.push_back(e);
    save();
    cout << "Added exam '" << subj << "'\n";
}

void removeExam() {
    if (exams.empty()) { cout << "\nNo exams.\n"; return; }

    int id;
    cout << "\nExam ID: "; cin >> id; flush();

    int idx = findExam(id);
    if (idx == -1) { cout << "Not found.\n"; return; }

    cout << "Removed '" << exams[idx].subject << "'\n";
    exams.erase(exams.begin() + idx);
    save();
}

void addTopic() {
    int eid;
    cout << "\nExam ID: "; cin >> eid; flush();
    int idx = findExam(eid);
    if (idx == -1) { cout << "Not found.\n"; return; }

    string name; int w;
    cout << "Topic name: "; getline(cin, name);
    if (name.empty()) return;
    cout << "Weightage (1-10): "; cin >> w; flush();
    if (w < 1) w = 1;
    if (w > 10) w = 10;

    exams[idx].topics.push_back({name, w, false});
    save();
    cout << "Added '" << name << "' to " << exams[idx].subject << "\n";
}

void removeTopic() {
    int eid;
    cout << "\nExam ID: "; cin >> eid; flush();
    int idx = findExam(eid);
    if (idx == -1) { cout << "Not found.\n"; return; }

    if (exams[idx].topics.empty()) { cout << "No topics.\n"; return; }

    cout << "Topics:\n";
    for (int i = 0; i < (int)exams[idx].topics.size(); i++)
        cout << "  " << i+1 << ". " << exams[idx].topics[i].name << "\n";

    int pick;
    cout << "Remove #: "; cin >> pick; flush();
    if (pick < 1 || pick > (int)exams[idx].topics.size()) {
        cout << "Invalid.\n"; return;
    }
    cout << "Removed '" << exams[idx].topics[pick-1].name << "'\n";
    exams[idx].topics.erase(exams[idx].topics.begin() + pick - 1);
    save();
}

void toggleTopic() {
    int eid;
    cout << "\nExam ID: "; cin >> eid; flush();
    int idx = findExam(eid);
    if (idx == -1) { cout << "Not found.\n"; return; }

    if (exams[idx].topics.empty()) { cout << "No topics.\n"; return; }

    cout << "Topics:\n";
    for (int i = 0; i < (int)exams[idx].topics.size(); i++) {
        cout << "  " << i+1 << ". ";
        cout << (exams[idx].topics[i].done ? "[x] " : "[ ] ");
        cout << exams[idx].topics[i].name << "\n";
    }

    int pick;
    cout << "Toggle #: "; cin >> pick; flush();
    if (pick < 1 || pick > (int)exams[idx].topics.size()) {
        cout << "Invalid.\n"; return;
    }

    exams[idx].topics[pick-1].done = !exams[idx].topics[pick-1].done;
    save();
    string status = exams[idx].topics[pick-1].done ? "Completed" : "Pending";
    cout << exams[idx].topics[pick-1].name << " -> " << status << "\n";
}

void menu() {
    cout << "\n=== Student Scheduler ===" << endl;
    cout << "1. View Assignments" << endl;
    cout << "2. Add Assignment" << endl;
    cout << "3. Update Completion" << endl;
    cout << "4. Remove Assignment" << endl;
    cout << "5. View Exams" << endl;
    cout << "6. Add Exam" << endl;
    cout << "7. Remove Exam" << endl;
    cout << "8. Add Topic to Exam" << endl;
    cout << "9. Remove Topic" << endl;
    cout << "10. Toggle Topic Done" << endl;
    cout << "0. Exit" << endl;
    cout << "\n> ";
}

void jsonAssignments() {
    cout << "{\"assignments\": [";
    for (int i = 0; i < (int)assignments.size(); i++) {
        auto tl = getTimeLeft(assignments[i].deadline);
        cout << "{"
             << "\"id\":" << assignments[i].id << ","
             << "\"name\":\"" << assignments[i].name << "\","
             << "\"deadline\":\"" << prettyDate(assignments[i].deadline) << "\","
             << "\"timeLeft\":\"" << tl.text << "\","
             << "\"completion\":" << assignments[i].completion
             << "}" << (i == (int)assignments.size() - 1 ? "" : ",");
    }
    cout << "]}" << endl;
}

void jsonExams() {
    cout << "{\"exams\": [";
    for (int i = 0; i < (int)exams.size(); i++) {
        auto tl = getTimeLeft(exams[i].date);
        int ready = calcReadiness(exams[i].topics);
        cout << "{"
             << "\"id\":" << exams[i].id << ","
             << "\"subject\":\"" << exams[i].subject << "\","
             << "\"date\":\"" << prettyDate(exams[i].date) << "\","
             << "\"timeLeft\":\"" << tl.text << "\","
             << "\"readiness\":" << ready << ","
             << "\"topics\": [";
        for (int j = 0; j < (int)exams[i].topics.size(); j++) {
            cout << "{"
                 << "\"name\":\"" << exams[i].topics[j].name << "\","
                 << "\"weightage\":" << exams[i].topics[j].weightage << ","
                 << "\"done\":" << (exams[i].topics[j].done ? "true" : "false")
                 << "}" << (j == (int)exams[i].topics.size() - 1 ? "" : ",");
        }
        cout << "]"
             << "}" << (i == (int)exams.size() - 1 ? "" : ",");
    }
    cout << "]}" << endl;
}

int main(int argc, char* argv[]) {
    if (!loadAll(SAVEFILE, assignments, exams)) {
        loadSeedData();
        save();
    } else {
        for (int i = 0; i < (int)assignments.size(); i++) syncId(assignments[i].id);
        for (int i = 0; i < (int)exams.size(); i++) syncId(exams[i].id);
    }

    if (argc > 1) {
        string cmd = argv[1];
        if (cmd == "--list-assignments") {
            jsonAssignments();
        } else if (cmd == "--list-exams") {
            jsonExams();
        } else if (cmd == "--add-assignment" && argc >= 7) {
            Assignment a;
            a.id = nextId();
            a.name = argv[2];
            a.deadline = makeTime(argv[3], stoi(argv[4]), stoi(argv[5]));
            a.completion = stoi(argv[6]);
            assignments.push_back(a);
            save();
            cout << "{\"status\":\"success\",\"id\":" << a.id << "}" << endl;
        } else if (cmd == "--update-assignment" && argc >= 4) {
            int id = stoi(argv[2]);
            int pct = stoi(argv[3]);
            for (auto& a : assignments) {
                if (a.id == id) {
                    a.completion = pct;
                    save();
                    cout << "{\"status\":\"success\"}" << endl;
                    return 0;
                }
            }
            cout << "{\"status\":\"error\",\"message\":\"not found\"}" << endl;
        } else if (cmd == "--remove-assignment" && argc >= 3) {
            int id = stoi(argv[2]);
            for (int i = 0; i < (int)assignments.size(); i++) {
                if (assignments[i].id == id) {
                    assignments.erase(assignments.begin() + i);
                    save();
                    cout << "{\"status\":\"success\"}" << endl;
                    return 0;
                }
            }
            cout << "{\"status\":\"error\",\"message\":\"not found\"}" << endl;
        } else if (cmd == "--add-exam" && argc >= 6) {
            Exam e;
            e.id = nextId();
            e.subject = argv[2];
            e.date = makeTime(argv[3], stoi(argv[4]), stoi(argv[5]));
            exams.push_back(e);
            save();
            cout << "{\"status\":\"success\",\"id\":" << e.id << "}" << endl;
        } else if (cmd == "--remove-exam" && argc >= 3) {
            int id = stoi(argv[2]);
            int idx = findExam(id);
            if (idx != -1) {
                exams.erase(exams.begin() + idx);
                save();
                cout << "{\"status\":\"success\"}" << endl;
            } else {
                cout << "{\"status\":\"error\",\"message\":\"not found\"}" << endl;
            }
        } else if (cmd == "--add-topic" && argc >= 5) {
            int eid = stoi(argv[2]);
            int idx = findExam(eid);
            if (idx != -1) {
                exams[idx].topics.push_back({argv[3], stoi(argv[4]), false});
                save();
                cout << "{\"status\":\"success\"}" << endl;
            } else {
                cout << "{\"status\":\"error\",\"message\":\"not found\"}" << endl;
            }
        } else if (cmd == "--toggle-topic" && argc >= 4) {
            int eid = stoi(argv[2]);
            int tidx = stoi(argv[3]);
            int idx = findExam(eid);
            if (idx != -1 && tidx >= 0 && tidx < (int)exams[idx].topics.size()) {
                exams[idx].topics[tidx].done = !exams[idx].topics[tidx].done;
                save();
                cout << "{\"status\":\"success\",\"done\":" << (exams[idx].topics[tidx].done ? "true" : "false") << "}" << endl;
            } else {
                cout << "{\"status\":\"error\",\"message\":\"not found\"}" << endl;
            }
        } else if (cmd == "--remove-topic" && argc >= 4) {
            int eid = stoi(argv[2]);
            int tidx = stoi(argv[3]);
            int idx = findExam(eid);
            if (idx != -1 && tidx >= 0 && tidx < (int)exams[idx].topics.size()) {
                exams[idx].topics.erase(exams[idx].topics.begin() + tidx);
                save();
                cout << "{\"status\":\"success\"}" << endl;
            } else {
                cout << "{\"status\":\"error\",\"message\":\"not found\"}" << endl;
            }
        }
        return 0;
    }

    int choice;
    while (true) {
        menu();
        cin >> choice;
        flush();

        switch(choice) {
            case 1: viewAssignments(); break;
            case 2: addAssignment(); break;
            case 3: updateCompletion(); break;
            case 4: removeAssignment(); break;
            case 5: viewExams(); break;
            case 6: addExam(); break;
            case 7: removeExam(); break;
            case 8: addTopic(); break;
            case 9: removeTopic(); break;
            case 10: toggleTopic(); break;
            case 0: cout << "bye\n"; return 0;
            default: cout << "huh?\n";
        }
    }
}
