N=008 is a mobile UI polish and input display normalization cycle. 
Two atomic objectives. First, fix numeric input display so age, height 
feet, height inches, weight, sleep, coffee, and alcohol fields do not 
auto-pad with leading zeroes (a value like '05' must display as '5' 
while preserving empty input states and not breaking the stored numeric 
parsing for the engine). Second, fix mobile layout so the page renders 
cleanly at 390px, 430px, 768px, and desktop widths with no overlap 
between the hero, evidence ledger, form fields, result card sections, 
lab upload, bottle scanner, and any sticky or footer elements, and 
with proper mobile safe-area padding at the bottom. Outer-shell visual 
polish is permitted in service of these two objectives. The 
recommendation engine, supplement database, conflict logic, scoring, 
API behavior, and data model are all FROZEN.