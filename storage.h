#ifndef STORAGE_H
#define STORAGE_H

#include "types.h"

void saveAll(string fname, vector<Assignment>& assignments, vector<Exam>& exams);
bool loadAll(string fname, vector<Assignment>& assignments, vector<Exam>& exams);

#endif
