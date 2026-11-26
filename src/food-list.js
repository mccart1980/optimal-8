/* ================================================================
   THE FOOD LIST — the foods FOOD · TODAY knows without being told
   (brief 34). Type "20g raisins" and the numbers come from here.

   One food to a line:

     Name | what it's called when typed | the numbers | portions

   THE NUMBERS are per 100 g (per 100 ml for a drink), in the order a
   packet prints them: calories, protein, carbohydrate, fat. A food
   weighed in more than one state has each, split by a semicolon and
   named: raw, cooked or dry. Carbohydrate is the packet's figure (the
   fibre isn't in it) and the calories are the packet's, so calories are
   near enough 4 × protein + 4 × carbs + 9 × fat; "+N" after the four
   numbers is the calories that come from fibre or alcohol, which those
   three don't hold. A test checks that sum on every line.

   PORTIONS, split by semicolons:
     1 egg = 58       it's counted in ones, and one is 58 g: "2 eggs",
                      and the name alone means one
     1 kebab ~ 400    a typical one is about 400 g, and the amount says
                      "about": "a kebab", and the name alone means one
     per breast ~ 150 a typical one is about 150 g, but it's a food
                      that's usually weighed: "2 chicken breasts" is
                      read, and the name alone asks for the grams
     tbsp 15          what a spoon, slice, tin, handful or glass of it
                      weighs: "2 tbsp peanut butter"
     ml               a drink: read and shown in millilitres

   WHERE THEY COME FROM: typical values for the ordinary version of each
   food, from the UK's food composition tables (McCance and Widdowson's
   Composition of Foods) and the panels on UK packets. A brand can sit
   10% either side; a takeaway or a made-up meal more than that, and
   those carry a typical portion. A food typed in from its own packet
   (FOOD · TODAY, "Add a food from its packet") is read before this list.

   The first name on a line is the one the app writes when a food is
   picked from a list, so it must read as that food and no other.
   ================================================================ */
export const TABLE = `
# Meat and poultry
Beef mince 5% | mince, beef mince, lean mince, 5% mince, minced beef, lean beef mince, 5% beef mince | raw 124 21 0 4.5; cooked 172 29 0 6.2
Beef mince 10% | 10% mince, 12% mince, 10% beef mince, 12% beef mince | raw 172 20 0 10; cooked 232 27 0 13.5
Beef mince 15 to 20% | 15% mince, 20% mince, fatty mince, 15% beef mince, 20% beef mince | raw 215 18 0 15.5; cooked 250 25 0 16.5
Steak (sirloin or rump) | steak, sirloin, rump, rump steak, sirloin steak, beef steak, minute steak | raw 150 22 0 7; cooked 200 30 0 9 | per steak ~ 170
Ribeye steak | ribeye, rib eye, ribeye steak, rib eye steak | raw 250 19 0 19.5; cooked 290 25 0 21 | per steak ~ 200
Fillet steak | fillet steak, beef fillet | raw 155 21 0 8; cooked 190 28 0 8.5 | per steak ~ 150
Roast beef | roast beef, beef, beef joint, topside, silverside, sliced beef | 180 31 0 6 | slice 30
Stewing beef | stewing beef, braising steak, diced beef, stewing steak, casserole beef | raw 125 22 0 4; cooked 185 32 0 6.3
Beef burger (the patty) | beef burger, beefburger, burger patty, beef patty | 280 24 1 20 | per burger ~ 90
Corned beef | corned beef | 205 25.9 1 10.9 | slice 30; tin 340
Biltong or beef jerky | biltong, beef jerky, jerky | 260 52 2 5
Liver | liver, lambs liver, lamb's liver, calves liver | 237 30.1 0 12.9
Roast lamb | roast lamb, lamb, leg of lamb, lamb leg, lamb shoulder, lamb steak | 230 28 0 13
Lamb mince | lamb mince, minced lamb | raw 240 17.5 0 19; cooked 265 24 0 18.5
Lamb chops | lamb chops, lamb cutlets | 300 26 0 22 | per chop ~ 70
Pork loin steak or chop | pork chop, pork, pork steak, pork loin, pork loin steak | raw 165 21 0 9; cooked 220 30 0 11 | per chop ~ 130
Pork fillet (tenderloin) | pork fillet, pork tenderloin, pork medallions | raw 120 22 0 3.5; cooked 165 30 0 5
Pork mince | pork mince, minced pork | raw 185 19 0 12; cooked 245 26 0 15.5
Pork belly | pork belly, belly pork, belly slices | 320 27 0 23.5
Pulled pork | pulled pork | 200 24 5 9
Gammon | gammon, gammon steak, gammon joint | raw 135 20 0.5 6; cooked 180 27 0.5 8 | per steak ~ 150
Ham | ham, sliced ham, cooked ham, wafer thin ham, honey roast ham | 110 19 1 3.2 | slice 25
Parma ham (prosciutto) | parma ham, prosciutto, serrano ham | 250 28 0.3 15 | slice 12
Back bacon | bacon, back bacon, bacon rashers, smoked bacon, unsmoked bacon | raw 215 16.5 0 16.5; cooked 287 23.2 0 21.6 | per rasher ~ 25
Streaky bacon | streaky bacon, streaky | raw 276 15.8 0 23.6; cooked 337 23.8 0 26.9 | per rasher ~ 10
Bacon medallions | bacon medallions | raw 115 21.5 0.5 3; cooked 155 29 0.5 4 | per medallion ~ 25
Pork sausage | sausage, pork sausage, banger, cumberland sausage, lincolnshire sausage | 290 15 8 22 | per sausage ~ 48
Chipolata | chipolata, cocktail sausage | 290 15 8 22 | per chipolata ~ 25
Chicken sausage | chicken sausage, chicken chipolata, turkey sausage | 160 19 3 8 | per sausage ~ 34
Vegetarian sausage | veggie sausage, vegetarian sausage, quorn sausage, vegan sausage, meat free sausage | 165 14 9 7.5 +8 | per sausage ~ 45
Black pudding | black pudding | 297 10.3 16.6 21.5 | slice 40
Haggis | haggis | 310 10.7 19.2 21.7
Chorizo | chorizo | 450 24 3 38
Salami | salami | 395 23 1.5 33 | slice 5
Pepperoni | pepperoni | 475 21 2 42.5 | slice 2.5
Peperami | peperami | 498 23.5 2.2 44 | 1 stick = 22.5
Pork scratchings | pork scratchings, scratchings, pork crackling | 605 48 0.5 46
Frankfurter | frankfurter, hot dog sausage, hotdog sausage | 287 13.6 1.1 25.4 | per frankfurter ~ 45
Hot dog in a roll | hot dog, hotdog | 262 10.7 28.5 12 | 1 hot dog ~ 110
Pork pie | pork pie | 370 10.5 24 26 | 1 pie ~ 140
Sausage roll | sausage roll | 330 9.5 24 22 | 1 roll ~ 100
Scotch egg | scotch egg | 245 12 13 16 | 1 egg ~ 113
Chicken breast | chicken, chicken breast, chicken fillet, grilled chicken | raw 106 24 0 1.1; cooked 148 32 0 2.2 | per breast ~ 150
Chicken thigh (no skin) | chicken thigh, chicken thigh fillet, thigh fillet | raw 125 19 0 5.5; cooked 180 25 0 9 | per thigh ~ 80
Chicken thigh, skin on | chicken thigh with skin, chicken thigh skin on, skin on chicken thigh | 230 23.5 0 15 | per thigh ~ 95
Chicken drumstick | chicken drumstick, drumstick, chicken leg | 185 26 0 9.1 | per drumstick ~ 70
Chicken wings | chicken wings, wings, hot wings | 250 25 0 16.5 | per wing ~ 30
Roast chicken (meat only) | roast chicken, rotisserie chicken, shredded chicken | 177 27.3 0 7.5
Sliced chicken (deli) | chicken slices, sliced chicken | 117 23.5 1 2 | slice 25
Chicken tikka pieces | chicken tikka, tikka chicken, tikka pieces, cooked chicken pieces | 150 26 3 3.5
Turkey breast | turkey, turkey breast, turkey steak, roast turkey | raw 105 24 0 1; cooked 153 33.5 0 2
Sliced turkey (deli) | turkey slices, sliced turkey | 110 23 1 1.5 | slice 25
Turkey mince 2% | turkey mince, turkey breast mince, 2% turkey mince, lean turkey mince | raw 108 24 0 1.4; cooked 150 33 0 2
Turkey mince 7% | 7% turkey mince, turkey thigh mince | raw 140 19.5 0 7; cooked 190 27 0 9
Chicken mince | chicken mince, minced chicken | raw 125 20 0 5; cooked 170 27 0 7
Duck (meat only) | duck, duck breast, roast duck | 195 25 0 10.5
Chicken nuggets | chicken nuggets, nuggets, mcnuggets, chicken mcnuggets | 255 15 18 13.5 | 1 nugget = 17
Breaded chicken | breaded chicken, chicken goujons, chicken dippers, chicken tenders, chicken strips, chicken escalope, chicken schnitzel | 215 18 15 9.5
Chicken kiev | chicken kiev, kiev | 265 14 12 18 | 1 kiev ~ 130
Fried chicken (takeaway) | fried chicken, kfc, southern fried chicken, kfc chicken | 250 20 9 15 | per piece ~ 90

# Fish and seafood
Tuna, tinned in spring water or brine | tuna, tinned tuna, tuna in brine, tuna in spring water, canned tuna, tuna chunks | 109 25 0 1 | 1 tin = 110
Tuna, tinned in oil | tuna in oil, tuna in sunflower oil, tuna in olive oil | 185 26 0 9 | 1 tin = 110
Tuna mayo | tuna mayo, tuna mayonnaise, tuna sweetcorn | 225 15 3 17
Tuna steak | tuna steak, fresh tuna, seared tuna | raw 115 26 0 1; cooked 150 34 0 1.3 | per steak ~ 120
Salmon | salmon, salmon fillet, salmon steak, baked salmon, grilled salmon | raw 200 20 0 13; cooked 230 25 0 14 | per fillet ~ 110
Smoked salmon | smoked salmon | 184 23 0.5 10 | slice 25
Tinned salmon | tinned salmon, canned salmon, red salmon, pink salmon, tin of salmon | 150 21.5 0 7 | tin 150
White fish (cod, haddock, pollock) | cod, cod fillet, white fish, haddock, pollock, basa, hake, coley, plaice, fish, smoked haddock, cod loin, fish fillet | raw 80 18 0 0.7; cooked 100 23 0 0.9 | per fillet ~ 130
Sea bass | sea bass, seabass, sea bream, bream | raw 158 19.5 0 9; cooked 195 24 0 11 | per fillet ~ 90
Trout | trout, rainbow trout | raw 130 20 0 5.5; cooked 165 25 0 7 | per fillet ~ 110
Mackerel | mackerel, fresh mackerel, grilled mackerel | raw 225 18.7 0 16.5; cooked 239 20.8 0 17.3 | per fillet ~ 80
Smoked mackerel | smoked mackerel, peppered mackerel | 330 20 0 28 | per fillet ~ 80
Tinned mackerel | tinned mackerel, canned mackerel, mackerel in tomato sauce, tin of mackerel | 220 19 0.5 16 | 1 tin = 90
Tinned sardines | sardines, tinned sardines, sardines in tomato sauce, pilchards | 190 22 0.5 11 | 1 tin = 90
Prawns | prawns, king prawns, cooked prawns, shrimp | 70 15.4 0 0.9
Scallops | scallops | raw 88 17 2.4 0.8; cooked 110 21 3 1
Mussels | mussels | 104 16.7 3.5 2.7
Crab sticks | crab sticks, seafood sticks, crabsticks | 95 7.5 14 0.8 | 1 stick = 16
Kippers | kippers | 255 20.1 0 19.4 | per fillet ~ 100
Fish fingers | fish fingers | 215 13.5 18 9.5 | 1 fish finger = 28
Fish in batter (chip shop) | battered fish, battered cod, chip shop fish, fish in batter, battered haddock, cod in batter | 247 16 11.7 15.4 | 1 portion ~ 200
Breaded fish fillet | breaded fish, breaded cod, breaded haddock, fish in breadcrumbs | 210 13 17 10 | per fillet ~ 125
Fish cake | fish cake, fishcake, salmon fishcake, cod fishcake | 185 9 18 8.5 | per fishcake ~ 115
Calamari (squid in batter) | calamari, squid rings, squid | 195 11.5 15.7 10
Sushi | sushi, sushi roll, nigiri, maki, california roll | 160 5.5 29 2.2 | piece 25

# Eggs and dairy
Egg | egg, boiled egg, scrambled egg, poached egg, hard boiled egg, whole egg | 131 12.6 0 9 | 1 egg = 58
Fried egg | fried egg | 179 13.6 0 13.9 | 1 egg = 55
Egg whites | egg whites, liquid egg whites | 50 10.5 0.8 0.1 | ml; per white ~ 33
Omelette (2 eggs) | omelette, plain omelette, 2 egg omelette, two egg omelette | 195 11 0 16.5 | 1 omelette ~ 115
Omelette (3 eggs) | 3 egg omelette, three egg omelette | 195 11 0 16.5 | 1 omelette ~ 165
Egg mayonnaise | egg mayo, egg mayonnaise | 220 9.5 1 20
Semi-skimmed milk | milk, semi skimmed milk, semi skimmed, green milk | 47 3.6 4.8 1.7 | ml
Whole milk | whole milk, full fat milk, blue milk, full cream milk | 65 3.4 4.7 3.7 | ml
Skimmed milk | skimmed milk, red milk, skim milk | 35 3.6 5 0.1 | ml
Oat milk | oat milk, oatly, oat drink | 46 1 6.7 1.5 | ml
Almond milk (unsweetened) | almond milk | 13 0.4 0 1.1 | ml
Soya milk | soya milk, soy milk | 39 3 2.5 1.8 | ml
Milkshake or flavoured milk (bottled) | milkshake, chocolate milk, chocolate milkshake, strawberry milkshake, banana milkshake, flavoured milk, yazoo, frijj | 63 3.2 9.5 1.5 | ml; bottle 400
Kefir | kefir | 58 3.4 4.4 3 | ml
Cheddar | cheese, cheddar, cheddar cheese, mature cheddar, grated cheese, grated cheddar, red leicester, double gloucester | 416 25.4 0.1 34.9 | slice 25; handful 30
Cheddar, lighter | light cheddar, lighter cheddar, reduced fat cheddar, half fat cheddar, low fat cheese, reduced fat cheese, light cheese | 312 27.5 0.5 22 | slice 25; handful 30
Mozzarella | mozzarella, mozzarella cheese | 250 18 1 19.5 | ball 125
Halloumi | halloumi, halloumi cheese | 320 22 1.5 25 | slice 30
Feta | feta, feta cheese | 270 16.5 1 22
Cottage cheese | cottage cheese | 100 11.5 3.5 4.3 | pot 300; tbsp 30
Cottage cheese, low fat | low fat cottage cheese, fat free cottage cheese | 72 11 4 1.5 | pot 300; tbsp 30
Cream cheese | cream cheese, soft cheese, philadelphia | 225 5.4 4.3 21 | tbsp 20
Cream cheese, light | light cream cheese, light soft cheese, philadelphia light, light philadelphia | 150 7.4 5 11 | tbsp 20
Parmesan | parmesan, grated parmesan, parmesan cheese | 402 33 0 30 | tbsp 6
Brie or camembert | brie, camembert | 340 20 0.5 29
Blue cheese (stilton) | stilton, blue cheese | 410 23.7 0.1 35
Edam, gouda or emmental | edam, gouda, emmental, swiss cheese, leerdammer, jarlsberg | 360 26 0 28.5 | slice 25
Goat's cheese | goats cheese, goat cheese | 320 21 1 26
Cheese slice (processed) | cheese slice, cheese single, burger cheese | 285 16 6 22 | 1 slice = 20
Babybel | babybel, mini babybel | 305 22 0.1 24 | 1 babybel = 20
Greek yoghurt, strained, 5% fat | greek yoghurt, total greek yoghurt, fage, full fat greek yoghurt, 5% greek yoghurt | 93 9 3 5 | pot 170; tbsp 30
Greek yoghurt, strained, 0% fat | 0% greek yoghurt, fat free greek yoghurt, 0% yoghurt, 0% fat greek yoghurt, total 0% | 54 10.3 3 0 | pot 170; tbsp 30
Greek-style yoghurt | greek style yoghurt, greek style | 125 4.5 5 9.8 | pot 150; tbsp 30
Natural yoghurt | yoghurt, natural yoghurt, plain yoghurt | 79 5.7 7.8 3 | pot 150; tbsp 30
Natural yoghurt, low fat | low fat yoghurt, low fat natural yoghurt, fat free yoghurt | 56 4.8 7.4 1 | pot 150; tbsp 30
Fruit yoghurt | fruit yoghurt, strawberry yoghurt, cherry yoghurt, raspberry yoghurt, peach yoghurt, vanilla yoghurt, flavoured yoghurt, muller corner, activia | 95 4 14 2.5 | 1 pot ~ 125
Skyr | skyr, icelandic yoghurt | 63 11 4 0.2 | pot 150; tbsp 30
High-protein yoghurt | protein yoghurt, high protein yoghurt, arla protein, protein pudding | 70 10 6 0.4 | 1 pot ~ 200
Butter | butter, salted butter, unsalted butter | 744 0.6 0.6 82.2 | tbsp 15; tsp 5; per knob ~ 10
Spreadable butter | spreadable butter, lurpak spreadable, spreadable, clover, anchor spreadable | 705 0.5 0.5 78 | tbsp 15; tsp 5
Spread (sunflower or olive) | margarine, spread, flora, bertolli, sunflower spread, olive spread | 500 0.3 1 55 | tbsp 15; tsp 5
Light spread | light spread, low fat spread, flora light | 350 0.3 1 38 | tbsp 15; tsp 5
Double cream | double cream, cream, whipping cream | 467 1.5 1.6 50.5 | tbsp 15
Single cream | single cream, pouring cream | 193 3.3 2.2 19.1 | tbsp 15
Crème fraîche | creme fraiche | 300 2.2 2.5 31 | tbsp 15
Sour cream | sour cream, soured cream | 200 2.5 3.5 19.5 | tbsp 15
Vanilla ice cream | ice cream, vanilla ice cream | 190 3.3 22 9.5 | scoop 60
Premium ice cream (tub) | premium ice cream, ben and jerry's, haagen dazs | 250 4 28 14 | scoop 60
Magnum | magnum, magnum classic | 300 3.8 28 19 | 1 magnum = 79
Ice lolly | ice lolly, lolly, fruit lolly, calippo | 80 0 19.5 0 | 1 lolly ~ 70
Custard | custard | 98 2.8 15.5 2.9 | pot 150; tin 400
Rice pudding | rice pudding, creamed rice | 91 3.2 15.2 1.9 | pot 180; tin 400
Jelly | jelly | 65 1.3 15 0 | pot 125

# Bread and bakery
White bread | bread, toast, white bread, white toast, slice of bread, slice of toast, sliced bread | 238 9 45 2 | 1 slice = 40
Wholemeal bread | wholemeal bread, brown bread, wholemeal toast, brown toast, wholegrain bread, granary bread | 221 10 39 2.5 +10 | 1 slice = 40
Seeded bread | seeded bread, seeded toast, multiseed bread | 277 11 40 7.5 +10 | 1 slice = 44
Sourdough | sourdough, sourdough bread, sourdough toast | 245 8.8 48 1.2 | 1 slice ~ 50
Plain bagel | bagel, plain bagel, new york bagel | 259 10.6 50.6 1.5 | 1 bagel = 85
Wholemeal wrap | wrap, tortilla, tortilla wrap, wholemeal wrap | 282 8.9 45.2 6.1 | 1 wrap = 62
White wrap | white wrap, plain wrap, flour tortilla, white tortilla | 298 8 50 6.5 | 1 wrap = 62
Pitta bread | pitta, pitta bread, pita | 265 9.2 53 1.3 | 1 pitta = 60
Naan bread | naan, naan bread, garlic naan, peshwari naan | 290 8.5 48 6.5 | 1 naan ~ 130
Chapati | chapati, chapatti, roti | 250 8 44 4 | 1 chapati ~ 55
Bread roll | bread roll, roll, bap, burger bun, white roll, bun, cob, finger roll, hot dog roll, sub roll | 262 9.5 48 3 | 1 roll = 60
Brioche bun | brioche bun, brioche, brioche roll | 320 9 48 9.5 | 1 bun = 55
Baguette | baguette, french stick, french bread | 265 9.3 53 1.5
Ciabatta | ciabatta, panini bread, ciabatta roll | 270 9.5 50 3.5 | 1 roll ~ 90
Crumpet | crumpet | 178 6 36 0.8 | 1 crumpet = 55
English muffin | english muffin, breakfast muffin, toasting muffin | 228 9.3 43 1.7 | 1 muffin = 70
Croissant | croissant | 405 8.3 43 22 | 1 croissant ~ 50
Pain au chocolat | pain au chocolat, chocolate croissant | 420 7.5 45 23 | 1 pastry ~ 60
Danish pastry | danish pastry, danish, cinnamon swirl, cinnamon roll, cinnamon bun | 375 5.8 50 17.5 | 1 pastry ~ 90
Hot cross bun or teacake | hot cross bun, teacake, fruit bun, toasted teacake | 275 7.8 50 4.5 | 1 bun = 70
Scone | scone, fruit scone, plain scone, cheese scone | 340 7.2 53 11.5 | 1 scone ~ 65
Malt loaf | malt loaf, soreen | 300 7.8 60 2.3 | slice 25
Pancakes | pancakes, scotch pancakes, american pancakes | 270 6.5 46 6.5 | per pancake ~ 35
Sweet waffle | waffle, belgian waffle, sweet waffle | 440 6 54 22 | 1 waffle ~ 50
Garlic bread | garlic bread, garlic baguette | 345 8 43 15 | slice 28
Cream crackers | crackers, cream crackers, jacobs crackers | 435 10 67 13.5 | 1 cracker = 8
Ryvita crispbread | ryvita, crispbread | 350 8.5 67 1.7 +33 | 1 slice = 10
Oatcakes | oatcakes, oat cakes | 445 10.5 58 17.5 +16 | 1 oatcake = 12
Rice cake | rice cake | 373 8 80 2.7 | 1 rice cake = 7.5
Breadsticks | breadsticks, grissini | 410 12 70 8 | 1 breadstick = 5
Yorkshire pudding | yorkshire pudding, yorkshire, yorkie pudding | 250 8 34 9 | per pudding ~ 22

# Breakfast cereals
Porridge oats | oats, porridge oats, rolled oats, jumbo oats, oatmeal, dry oats | 375 11 60 8 +18
Porridge made with milk | bowl of porridge, porridge made with milk, milky porridge, porridge with milk | 93 4.6 12.4 2.6 | 1 bowl ~ 290
Weetabix | weetabix, wheat biscuits, wheat bisks | 362 12 69 2 +20 | 1 biscuit = 18.8
Shredded Wheat | shredded wheat | 363 12 69 2.3 +24 | 1 biscuit = 22.5
Cornflakes | cornflakes, corn flakes | 378 7 84 0.9 | bowl 30
Bran flakes | bran flakes, branflakes | 360 10 67 2.2 +30 | bowl 30
Special K | special k | 375 9 79 1.5 | bowl 30
Rice Krispies | rice krispies, rice crispies | 387 7 86 1.2 | bowl 30
Coco Pops | coco pops, chocolate cereal | 382 6.3 84 1.9 | bowl 30
Frosties | frosties, frosted flakes | 375 4.5 87 0.6 | bowl 30
Crunchy Nut cornflakes | crunchy nut, crunchy nut cornflakes | 400 6 82 5 | bowl 30
Cheerios | cheerios | 380 9 74 4 +18 | bowl 30
Shreddies | shreddies | 358 10 71 1.9 +24 | bowl 40
Fruit and fibre | fruit and fibre | 360 8 69 6 +18 | bowl 40
Granola | granola, crunchy granola, oat clusters | 450 10 60 18 +12 | bowl 45
Muesli | muesli, alpen | 365 10.5 62 6.5 +16 | bowl 45
Cereal bar | cereal bar, granola bar, nutri grain, alpen bar, breakfast bar | 400 6 70 10 | 1 bar ~ 30
Nut bar | nut bar, kind bar, eat natural bar | 495 15 32 34 | 1 bar ~ 40
Flapjack | flapjack | 460 5.5 58 22 | 1 flapjack ~ 70

# Rice, pasta and grains
Pasta | pasta, spaghetti, penne, fusilli, macaroni, tagliatelle, linguine, white pasta | dry 355 12.5 72 1.5; cooked 160 5.7 32.7 0.7
Wholewheat pasta | wholewheat pasta, wholemeal pasta, whole wheat pasta, brown pasta, wholewheat spaghetti | dry 345 13 64 2.5 +16; cooked 140 5.5 27 1.1 +8
Fresh filled pasta | tortellini, ravioli, tortelloni, filled pasta | 190 8 27 5.5
Rice | rice, white rice, basmati, basmati rice, long grain rice, boiled rice, steamed rice, jasmine rice | dry 355 7 79 0.6; cooked 130 2.7 28 0.3
Brown rice | brown rice, wholegrain rice | dry 357 7.5 76 2.8; cooked 130 2.8 27.5 1
Egg fried rice | egg fried rice, fried rice, special fried rice | 186 4.2 30 5.5 | 1 portion ~ 350
Pilau rice | pilau rice, pilau, pilaf | 165 3.3 29 3.8 | 1 portion ~ 300
Risotto | risotto, mushroom risotto, chicken risotto | 130 4.5 18 4.2 | 1 portion ~ 350
Couscous | couscous, cous cous | dry 360 12.5 72 1.5; cooked 150 5.2 30 0.7
Quinoa | quinoa | dry 368 14 64 6; cooked 120 4.4 21.3 1.9
Egg noodles | noodles, egg noodles, medium noodles | dry 355 12 70 2; cooked 140 4.8 26 1.5
Rice noodles | rice noodles, vermicelli | dry 360 6.5 81 0.7; cooked 108 1.8 24 0.2
Instant noodles (dry weight) | instant noodles, super noodles, ramen, instant ramen, packet noodles, packet of noodles, indomie | 450 9.5 61 18 | 1 pack ~ 90
Pot Noodle | pot noodle | 457 10.3 60 17.8 | 1 pot = 90
Gnocchi | gnocchi | 150 3.5 32 0.5
Tinned spaghetti or hoops | tinned spaghetti, spaghetti hoops, hoops, spaghetti in tomato sauce, tin of spaghetti | 56 1.7 11.5 0.3 | tin 400
Plain flour | flour, plain flour, self raising flour | 350 10 73 1.3 | tbsp 10

# Potatoes
Potato | potato, new potato, boiled potato, baby potato | raw 77 2 17 0.1; cooked 75 1.8 17 0.1
Jacket potato | jacket potato, jacket, baked potato, jacket spud | 100 2.5 22 0.2 | 1 potato ~ 200
Mashed potato | mash, mashed potato, creamy mash | 104 1.8 15.5 4.3 | portion 200
Roast potatoes | roast potatoes, roasties, roasted potatoes | 160 2.8 26 5 | per potato ~ 50
Oven chips | chips, oven chips, mccain chips, home chips | 175 3 30 5 | portion 165
Chip shop chips | chip shop chips, chippy chips, takeaway chips, fried chips | 215 3.5 31 8.4 | 1 portion ~ 300
Fries (fast food) | fries, french fries, mcdonalds fries, skinny fries | 296 2.9 37 15 | 1 portion ~ 114
Sweet potato | sweet potato | raw 86 1.6 20 0.1; cooked 115 1.6 27 0.2
Sweet potato fries | sweet potato fries, sweet potato chips | 190 2 28 7.5 | portion 150
Potato wedges | wedges, potato wedges | 165 2.5 26 5.5 | portion 165
Hash brown | hash brown | 240 2.3 25 14.5 | 1 hash brown = 55
Potato waffle | potato waffle, birds eye waffle | 185 2.4 23 9 | 1 waffle = 52

# Vegetables and salad
Broccoli | broccoli, tenderstem | 35 3.5 3 0.6 +6
Mushrooms | mushrooms | 22 3.1 0.4 0.5
Carrots | carrots | 35 0.6 7.5 0.3
Peas | peas, garden peas, petit pois, frozen peas | 72 5.8 9.5 0.9 +10
Mushy peas | mushy peas | 80 5.5 12.5 0.6 +8
Sweetcorn | sweetcorn, corn, tinned sweetcorn, corn on the cob | 82 2.8 15 1.2 | tin 165
Green beans | green beans, runner beans, fine beans | 25 1.9 3.2 0.4
Spinach | spinach | 25 2.8 1.6 0.8
Kale | kale | 33 3.4 1.4 1.6
Cabbage | cabbage, red cabbage, white cabbage, savoy cabbage, spring greens | 26 1.7 4.1 0.4
Cauliflower | cauliflower | 34 3.6 3 0.9
Brussels sprouts | sprouts, brussels sprouts, brussel sprouts | 38 3.2 3.8 1.3
Asparagus | asparagus | 25 2.9 2 0.6
Courgette | courgette, zucchini | 18 1.8 1.8 0.4
Aubergine | aubergine, eggplant | 15 0.9 2.2 0.4
Pepper | pepper, bell pepper, red pepper, green pepper, yellow pepper | 30 1 5.5 0.4 | per pepper ~ 150
Onion | onion, red onion, spring onion | 36 1.2 7.9 0.2 | per onion ~ 150
Tomato | tomato | 17 0.7 3.1 0.3 | per tomato ~ 85
Cherry tomatoes | cherry tomatoes, baby tomatoes, baby plum tomatoes | 20 0.8 3.4 0.4 | per tomato ~ 12
Tinned chopped tomatoes | chopped tomatoes, tinned tomatoes, plum tomatoes, tin of tomatoes | 22 1.1 3.8 0.1 | tin 400
Passata | passata | 30 1.3 5.5 0.2
Tomato purée | tomato puree, tomato paste | 80 4.5 13 0.3 | tbsp 15
Cucumber | cucumber | 10 0.7 1.5 0.1
Lettuce and salad leaves | lettuce, salad, salad leaves, mixed salad, rocket, side salad, mixed leaves, iceberg | 14 0.8 1.7 0.5 | handful 30
Celery | celery | 8 0.5 0.9 0.2
Beetroot | beetroot | 44 1.9 9 0.1
Leek | leek | 22 1.6 2.9 0.5
Parsnip | parsnip | 66 1.6 12.9 1.2
Swede or turnip | swede, turnip | 24 0.7 5 0.3
Butternut squash | butternut squash, butternut, pumpkin | 36 1.1 8.3 0.1
Avocado | avocado, avo | 190 1.9 1.9 19.5 | per avocado ~ 130
Olives | olives | 140 1 0.5 15 | 1 olive = 4
Mixed vegetables | mixed veg, mixed vegetables, vegetables, veg, frozen veg, stir fry veg, stir fry vegetables | 50 3 7 0.7 +7
Coleslaw | coleslaw | 165 1 6 15
Potato salad | potato salad | 160 1.6 13 11
Gherkins | gherkins, pickled gherkins, dill pickle | 14 0.9 2.6 0.1
Sauerkraut or kimchi | sauerkraut, kimchi | 20 1.3 2.6 0.3

# Fruit
Banana | banana | 87.5 1.1 22.5 0.3 | 1 banana = 120
Apple | apple | 53 0.3 12.7 0.1 | 1 apple = 150
Orange | orange | 43 1 9.3 0.1 | 1 orange = 140
Satsuma or clementine | satsuma, clementine, tangerine, easy peeler, mandarin | 39 0.9 8.5 0.1 | 1 satsuma = 70
Pear | pear | 43 0.3 10.9 0.1 | 1 pear = 150
Grapes | grapes | 62 0.4 15.4 0.1 | per grape ~ 5; handful 80
Strawberries | strawberries | 30 0.7 6 0.3 | per strawberry ~ 12; handful 80
Blueberries | blueberries | 45 0.8 10 0.3 | handful 40
Raspberries | raspberries | 30 1.3 4.6 0.3 +8 | handful 40
Blackberries | blackberries | 30 0.9 5.1 0.2 +6 | handful 40
Mixed berries | berries, mixed berries, frozen berries, summer fruits, forest fruits | 35 0.9 6.5 0.3 | handful 40
Cherries | cherries | 48 0.9 11.5 0.1 | per cherry ~ 7
Peach or nectarine | peach, nectarine | 36 1 7.6 0.1 | 1 peach = 110
Plum | plum | 39 0.6 8.8 0.1 | 1 plum = 55
Kiwi | kiwi, kiwi fruit | 51 1.1 10.6 0.5 | 1 kiwi = 70
Mango | mango | 60 0.7 14.1 0.2
Pineapple | pineapple | 43 0.4 10.1 0.2
Melon | melon, honeydew, cantaloupe, galia | 28 0.6 6.6 0.1
Watermelon | watermelon | 31 0.5 7.1 0.3
Grapefruit | grapefruit | 30 0.8 6.8 0.1 | per grapefruit ~ 160
Tinned fruit in juice | tinned fruit, fruit cocktail, tinned peaches, tinned pineapple, fruit salad, fruit pot, tin of fruit, tin of peaches, tin of pineapple | 50 0.5 11.5 0.1
Raisins or sultanas | raisins, sultanas, currants, dried fruit | 295 2.5 70 0.5 | handful 30; tbsp 15
Dried date | dates, dried dates, pitted dates | 300 2.5 72.5 0 | 1 date = 8
Medjool date | medjool dates, medjool | 290 1.8 72 0.2 | 1 date = 22
Dried apricots | dried apricots, apricots | 190 3.5 40 0.6 +14 | 1 apricot = 8
Prunes | prunes | 165 2.5 36 0.4 +12 | 1 prune = 8
Dried cranberries | dried cranberries, cranberries, craisins | 330 0.3 80 1 | handful 30
Dried mango | dried mango | 320 2.5 74 1
Banana chips | banana chips | 520 2.3 58 31
Fruit smoothie | smoothie, fruit smoothie, innocent smoothie | 54 0.6 12 0.1 | ml; bottle 250

# Beans, nuts and seeds
Baked beans | beans, baked beans, heinz beans, beanz | 79 4.7 12.9 0.2 +8 | 1 tin = 415
Tinned chickpeas | chickpeas, tinned chickpeas, garbanzo beans | 120 7 15 2.5 +10 | tin 240
Tinned beans (kidney, black, butter) | kidney beans, black beans, butter beans, cannellini beans, mixed beans, tinned beans, haricot beans, borlotti beans, pinto beans | 105 7.5 13 0.6 +14 | tin 240
Lentils | lentils, red lentils, green lentils, puy lentils, tinned lentils, brown lentils | dry 335 24 52 1.5 +22; cooked 105 8.5 16 0.6 +8 | tin 240
Hummus | hummus, houmous, humous | 300 7 10 25 +10 | tbsp 20; pot 200
Hummus, reduced fat | reduced fat hummus, light hummus, low fat hummus | 200 7.5 11 13 +10 | tbsp 20; pot 200
Falafel | falafel | 240 8 22 12 +14 | 1 falafel = 22
Tofu | tofu, firm tofu | 120 13 1.5 7
Quorn mince or pieces | quorn, quorn mince, quorn pieces, vegan mince, meat free mince, veggie mince, soya mince | 100 14 3 2 +13
Veggie burger (the patty) | veggie burger, vegetarian burger, bean burger, vegan burger, plant burger | 190 12 12 10 +8 | 1 burger ~ 100
Edamame | edamame, soya beans, edamame beans | 140 12 6 6.5 +10
Peanut butter | peanut butter, pb, crunchy peanut butter, smooth peanut butter | 600 25 13 50 | tbsp 16; tsp 8
Almond butter | almond butter, nut butter, cashew butter | 630 21 7 56 +20 | tbsp 16; tsp 8
Peanuts | peanuts, salted peanuts, roasted peanuts, dry roasted peanuts, monkey nuts | 600 26 9 50 +14 | handful 30
Almonds | almonds | 610 21 7 54 +20 | handful 30; per almond ~ 1.2
Cashews | cashews, cashew nuts | 585 18.5 22 47 | handful 30
Walnuts | walnuts | 690 15 3.3 68.5 | handful 30
Brazil nuts | brazil nuts, brazils | 682 14.1 3.1 68.2 | per nut ~ 4
Pistachios | pistachios | 585 20 14 49 +14 | handful 30
Hazelnuts | hazelnuts | 650 14 6 63.5 | handful 30
Pecans | pecans | 700 9.2 5.8 70 | handful 30
Mixed nuts | nuts, mixed nuts | 610 22.9 7.9 54.1 | handful 30
Fruit and nut mix | trail mix, fruit and nut mix, fruit and nut, nuts and raisins | 480 12 40 30 | handful 30
Chia seeds | chia seeds, chia | 450 18 5 31 +68 | tbsp 12; tsp 4
Flaxseed | flaxseed, linseed, milled flaxseed, ground flaxseed | 520 20 2 41 +54 | tbsp 10; tsp 4
Pumpkin seeds | pumpkin seeds | 575 27 9 47 +12 | tbsp 10; handful 30
Sunflower seeds | sunflower seeds | 581 19.8 18.6 47.5 | tbsp 10; handful 30
Mixed seeds | seeds, mixed seeds, sesame seeds | 580 24 10 48 +16 | tbsp 10; handful 30
Tahini | tahini | 607 18.5 0.9 58.9 | tbsp 15

# Oils, sauces and spreads
Oil (olive, vegetable or sunflower) | oil, olive oil, vegetable oil, sunflower oil, rapeseed oil, cooking oil, coconut oil, sesame oil | 899 0 0 99.9 | tbsp 14; tsp 5
Ghee, lard or dripping | ghee, lard, dripping, beef dripping, goose fat | 895 0 0 99.5 | tbsp 13; tsp 5
Mayonnaise | mayo, mayonnaise, hellmanns | 720 1.1 1.5 79 | tbsp 15; tsp 5
Light mayonnaise | light mayo, light mayonnaise, lighter mayo, low fat mayo | 265 0.7 7 26 | tbsp 15; tsp 5
Salad cream | salad cream | 330 1.5 19 27 | tbsp 15
Ketchup | ketchup, tomato ketchup, tomato sauce, red sauce | 102 1.2 23.2 0.1 | tbsp 15; tsp 5
Brown sauce | brown sauce, hp sauce, hp | 122 0.9 28.3 0.1 | tbsp 15
BBQ sauce | bbq sauce, barbecue sauce | 150 1 35 0.3 | tbsp 15
Sweet chilli sauce | sweet chilli sauce, chilli sauce | 230 0.5 55 0.5 | tbsp 15
Hot sauce | hot sauce, sriracha, tabasco | 30 1 5 0.5 | tbsp 15; tsp 5
Soy sauce | soy sauce, soya sauce | 70 9 6 0 | tbsp 15; tsp 5
Mustard | mustard | 150 7 8 9 | tsp 5
Gravy | gravy | 30 0.5 4 1.5 | ml
Cheese sauce | cheese sauce | 179 8.1 9.1 12.6
White sauce | white sauce, bechamel, parsley sauce | 128 4.2 10.7 7.8
Pesto | pesto, green pesto, red pesto | 420 5 5 42 | tbsp 15
Tomato pasta sauce (jar) | pasta sauce, tomato pasta sauce, dolmio, marinara, arrabbiata | 50 1.5 8 1 | jar 500
Curry sauce (jar) | curry sauce, tikka masala sauce, korma sauce, cooking sauce | 115 1.5 9 8 | jar 450
Salsa | salsa | 35 1.2 6.5 0.3 | tbsp 15
Guacamole | guacamole, guac | 150 1.7 3 14.5 | tbsp 20
Tzatziki | tzatziki | 120 4 4 10 | tbsp 20
Vinaigrette dressing | salad dressing, dressing, vinaigrette, french dressing, balsamic dressing | 300 0.5 8 30 | tbsp 15
Caesar dressing | caesar dressing | 430 2 4 45 | tbsp 15
Pickle (Branston) | pickle, branston, branston pickle | 125 0.6 30 0.2 | tbsp 15
Chutney | chutney, mango chutney, onion chutney | 230 0.5 56 0.3 | tbsp 20
Honey | honey | 320 0.4 80 0 | tbsp 20; tsp 7
Jam or marmalade | jam, marmalade, strawberry jam, raspberry jam | 250 0.4 62 0.1 | tbsp 18; tsp 7
Chocolate spread | chocolate spread, nutella | 540 6.3 57.5 31 | tbsp 18; tsp 8
Marmite | marmite, vegemite, yeast extract | 260 34 30 0.5 | tsp 5
Golden syrup | golden syrup, syrup | 325 0.3 80.5 0 | tbsp 20; tsp 7
Maple syrup | maple syrup, agave | 265 0 67 0 | tbsp 20; tsp 7
Sugar | sugar, white sugar, brown sugar, caster sugar | 400 0 100 0 | tsp 4; tbsp 13
Tinned coconut milk | coconut milk, tinned coconut milk | 180 1.6 2.7 18 | tin 400

# Snacks, sweets and puddings
Crisps | crisps, ready salted crisps, walkers, salt and vinegar crisps, cheese and onion crisps, quavers, wotsits, hula hoops, monster munch, kettle chips, mccoys | 520 6.1 52 31.5 | 1 bag ~ 25; handful 15
Pringles | pringles | 515 6 56 30
Tortilla chips | tortilla chips, doritos, nachos | 495 7 60 25 | handful 20
Popcorn | popcorn, sweet popcorn, salted popcorn | 480 6 60 22 +16
Pretzels | pretzels | 385 10 78 3.5
Prawn crackers | prawn crackers | 540 2.5 58 33
Milk chocolate | chocolate, milk chocolate, dairy milk, galaxy, chocolate bar | 535 7.3 57 30 | bar 45; square 6
Dark chocolate | dark chocolate, 70% chocolate, 85% chocolate, 70% dark chocolate | 580 9 35 42 +22 | square 10
White chocolate | white chocolate, milkybar | 550 6 58 32 | square 6
Mars bar | mars bar, mars | 447 4.3 69 16.7 | 1 bar = 51
Snickers | snickers | 510 9.4 58 26 | 1 bar = 48
Twix | twix | 495 4.5 64 24 | 1 bar = 50
KitKat (4 fingers) | kitkat, kit kat | 507 6.5 61.5 25.5 | 1 bar = 41.5
Twirl | twirl, wispa, flake | 535 7.5 56 30.5 | 1 bar = 43
Maltesers | maltesers | 505 8 61.5 24.5 | 1 bag = 37
M&M's | m and ms, peanut m and ms | 505 8.5 61 25 | 1 bag = 45
Kinder Bueno | kinder bueno, bueno | 572 8.6 49.5 37.3 | 1 pack = 43
Digestive biscuit | digestive, biscuit, digestive biscuit | 480 7.2 62.8 21.6 | 1 biscuit = 14.8
Chocolate digestive or chocolate Hobnob | chocolate digestive, chocolate biscuit, chocolate hobnob | 497 6.6 62.3 24.5 | 1 biscuit = 16.7
Hobnob | hobnob | 479 7 62 22 | 1 biscuit = 14
Rich tea | rich tea, rich tea biscuit, malted milk | 458 7.2 71 15.5 | 1 biscuit = 8.3
Custard cream or bourbon | custard cream, bourbon, bourbon biscuit | 490 5.6 69 22.5 | 1 biscuit = 12.5
Shortbread | shortbread, shortbread finger | 525 5.8 60.5 29 | 1 finger = 19
Jaffa cake | jaffa cake | 377 4.9 70.5 8.2 | 1 cake = 12.2
Oreo | oreo | 475 5.5 69 20 | 1 biscuit = 11
Cookie | cookie, chocolate chip cookie, bakery cookie | 480 5.5 62 23 | 1 cookie ~ 55
Sponge cake | cake, sponge cake, victoria sponge, birthday cake, cupcake, lemon drizzle, carrot cake, banana bread, banana loaf, swiss roll | 390 4 52 18 | slice 70
Chocolate cake | chocolate cake, chocolate fudge cake | 420 5 50 22 | slice 75
Muffin | muffin, blueberry muffin, chocolate muffin | 390 5 48 19.5 | 1 muffin ~ 115
Doughnut | doughnut, jam doughnut, ring doughnut, krispy kreme | 343 5.7 48.6 14.3 | 1 doughnut ~ 70
Brownie | brownie, chocolate brownie | 440 5.5 52 23 | 1 brownie ~ 60
Cheesecake | cheesecake | 330 5 30 21 | slice 100
Fruit pie or crumble | apple pie, apple crumble, crumble, fruit pie, fruit crumble | 240 2.6 35 10 | 1 portion ~ 120
Mince pie | mince pie | 395 3.8 59 15.5 | 1 pie = 58
Christmas pudding or cake | christmas pudding, christmas cake, fruit cake | 330 3.2 56 10 | 1 portion ~ 100
Sponge pudding with sauce | sticky toffee pudding, sponge pudding, treacle sponge, syrup sponge | 345 3.5 52 14 | 1 portion ~ 110
Sweet tart (bakewell, jam, custard) | tart, bakewell tart, jam tart, custard tart, egg custard tart, treacle tart | 380 4.5 55 16 | 1 tart ~ 45
Jelly sweets | sweets, haribo, wine gums, jelly babies, fruit pastilles, jelly sweets, starmix, gummy bears | 345 6.5 77 0.5 | handful 30
Fudge or toffee | fudge, toffee, caramel | 440 2.5 72 16

# Drinks
Orange juice | orange juice, juice, oj, fresh orange juice | 45 0.7 10 0 | ml
Apple juice | apple juice, cranberry juice, pineapple juice, fruit juice | 45 0.1 10.5 0.1 | ml
Cola | coke, cola, coca cola, pepsi, full fat coke, regular coke, dr pepper | 42 0 10.6 0 | ml; 1 can = 330
Diet or zero drink | diet coke, coke zero, pepsi max, diet pepsi, diet drink, sugar free drink, diet lemonade, sprite zero, fanta zero | 1 0 0 0 | ml; 1 can = 330
Lemonade or fizzy orange | lemonade, sprite, fanta, 7up, fizzy drink, irn bru, fizzy orange, tango, pop, ginger beer, ginger ale | 20 0 4.8 0 | ml; 1 can = 330
Squash (no added sugar) | squash, cordial, robinsons, vimto | 2 0 0.3 0 | ml
Water | water, sparkling water, fizzy water, soda water | 0 0 0 0 | ml
Tea or coffee, no milk | black coffee, black tea, americano, espresso, green tea, herbal tea, peppermint tea | 1 0.1 0 0 | ml; 1 mug = 260
Tea or coffee with milk | tea, coffee, tea with milk, coffee with milk, white coffee, builders tea, cup of tea, cuppa, instant coffee | 6 0.4 0.6 0.2 | ml; 1 mug = 260
Latte, cappuccino or flat white | latte, cappuccino, flat white | 40 2.8 3.9 1.4 | ml; 1 cup ~ 350
Hot chocolate | hot chocolate, cocoa, drinking chocolate | 75 3.5 10.5 2 | ml; 1 mug ~ 260
Lager or beer (about 4.5%) | beer, lager, pint, ale, bitter, ipa, stella, carling, peroni, corona, heineken | 37 0.3 2.8 0 +25 | ml; 1 pint = 568; bottle 330; can 440
Stout | guinness, stout | 36 0.3 3 0 +23 | ml; 1 pint = 568; can 440
Cider (about 4.5%) | cider, strongbow, magners, thatchers, kopparberg | 38 0 3 0 +25 | ml; 1 pint = 568; bottle 500; can 440
Alcohol-free beer | alcohol free beer, non alcoholic beer, zero alcohol beer | 20 0.3 4.5 0 | ml; 1 bottle = 330
Wine | wine, red wine, white wine, rose | 85 0.1 1 0 +80 | ml; 1 glass ~ 175; bottle 750
Prosecco or champagne | prosecco, champagne, cava | 75 0.2 1.5 0 +67 | ml; 1 glass ~ 125; bottle 750
Spirits (vodka, gin, whisky, rum) | vodka, gin, whisky, whiskey, rum, tequila, brandy, spirit, jack daniels, bacardi | 222 0 0 0 +222 | ml; 1 single = 25
Baileys | baileys, irish cream | 327 3 25 13 +94 | ml; 1 measure = 50
Tonic water | tonic water, tonic | 22 0 5 0 | ml
Coconut water | coconut water | 19 0.2 4.4 0 | ml

# Meals and takeaway
Pizza, cheese and tomato | pizza, margherita, cheese and tomato pizza, margherita pizza, cheese pizza | 260 11 32 9.5 | slice 80; per pizza ~ 350
Pizza, pepperoni or meat | pepperoni pizza, meat feast pizza, meat pizza, dominos, meat feast, bbq chicken pizza, ham and pineapple pizza, hawaiian pizza | 285 12.5 30 12.5 | slice 80; per pizza ~ 400
Burger in a bun (quarter-pounder) | burger, hamburger, burger in a bun, pub burger, homemade burger | 239 15 17.2 12.2 | 1 burger ~ 180
Cheeseburger (fast food) | cheeseburger, mcdonalds cheeseburger | 261 13.9 27 10.4 | 1 burger = 115
Big Mac | big mac | 233 12.1 19.5 11.6 | 1 burger = 215
Quarter-pounder with cheese | quarter pounder, quarter pounder with cheese | 258 15.5 18.5 13 | 1 burger = 200
Chicken burger (fast food) | chicken burger, mcchicken, zinger, chicken fillet burger | 223 9.7 22.9 9.7 | 1 burger = 175
Sausage and egg McMuffin | mcmuffin, sausage and egg mcmuffin, sausage mcmuffin | 243 14.3 15 14.3 | 1 muffin = 175
Doner kebab in pitta with salad | doner kebab, kebab, donner kebab, lamb doner | 248 14.1 12.5 16 | 1 kebab ~ 400
Chicken shish kebab in pitta | chicken kebab, chicken shish, shish kebab, chicken shish kebab | 150 13.5 14 4 | 1 kebab ~ 350
Doner kebab meat | doner meat, kebab meat, doner kebab meat | 377 24 0 31
Fish and chips (chip shop) | fish and chips, cod and chips, fish supper | 227 8.2 23.8 11 | 1 portion ~ 480
Chicken tikka masala | tikka masala, chicken tikka masala, butter chicken, curry | 160 12 6 10 | 1 portion ~ 350
Chicken korma | korma, chicken korma, pasanda | 190 12 7 13 | 1 portion ~ 350
Chicken curry (madras, jalfrezi, balti) | chicken curry, madras, jalfrezi, balti, bhuna, chicken madras, chicken jalfrezi, vindaloo | 130 12.5 4.5 7 | 1 portion ~ 350
Lamb curry | lamb curry, rogan josh, lamb bhuna, lamb madras | 165 12 5 11 | 1 portion ~ 350
Vegetable curry | vegetable curry, veg curry, saag aloo, bombay potatoes, chana masala | 100 2.5 9 6 | 1 portion ~ 300
Dal | dal, dhal, daal, tarka dal | 110 6 13 3.5 | 1 portion ~ 300
Thai green or red curry | thai green curry, thai red curry, thai curry, massaman | 125 8 5 8.5 | 1 portion ~ 350
Onion bhaji | onion bhaji, bhaji, pakora | 250 6 24 14 | per bhaji ~ 45
Samosa | samosa | 250 5 28 13 | per samosa ~ 60
Poppadom | poppadom, papadum, poppadum | 477 15.4 42.3 27.7 | 1 poppadom = 13
Sweet and sour chicken | sweet and sour chicken, sweet and sour, chicken balls, sweet and sour pork | 200 9 24 8 | 1 portion ~ 350
Chicken chow mein | chow mein, chicken chow mein, stir fry noodles, singapore noodles | 150 8.5 15 6 | 1 portion ~ 350
Beef or chicken in black bean sauce | beef in black bean sauce, black bean beef, chicken in black bean sauce, black bean chicken, kung po chicken | 120 10 7 6 | 1 portion ~ 350
Crispy chilli beef | crispy chilli beef, crispy beef, crispy shredded beef, salt and pepper chicken | 270 12 28 12 | 1 portion ~ 300
Spring roll | spring roll | 240 6 24 13.5 | per roll ~ 60
Gyoza or dumplings | gyoza, dumplings, dim sum | 200 8 24 7.5 | per dumpling ~ 20
Curry and rice ready meal | ready meal, curry ready meal, curry and rice, microwave meal | 130 6.5 16.5 4 | 1 meal ~ 400
Lasagne | lasagne, beef lasagne | 150 8.5 13 7 | 1 portion ~ 400
Spaghetti bolognese | spaghetti bolognese, spag bol, bolognese, pasta bolognese | 130 7 15 4.5 | 1 portion ~ 400
Bolognese sauce (meat sauce) | bolognese sauce, meat sauce, ragu | 120 10 4.5 6.5
Chilli con carne | chilli con carne, chilli | 115 9 8 5 +4 | 1 portion ~ 300
Cottage or shepherd's pie | cottage pie, shepherds pie | 115 6.5 10 5.5 | 1 portion ~ 400
Fish pie | fish pie | 120 7.5 10 5.5 | 1 portion ~ 400
Macaroni cheese | macaroni cheese, mac and cheese | 165 7 15 8.5 | 1 portion ~ 350
Carbonara or creamy pasta bake | carbonara, spaghetti carbonara, creamy pasta, pasta bake, tuna pasta bake, cheesy pasta | 165 7.5 17.5 7 | 1 portion ~ 400
Beef stew | stew, beef stew, casserole, beef casserole, chicken casserole, hotpot, lamb stew, sausage casserole | 105 10 6 4.5 | 1 portion ~ 400
Meat pie | pie, steak pie, meat pie, chicken pie, steak and kidney pie, chicken and mushroom pie, pukka pie, steak and ale pie | 270 9 23 16 | 1 pie ~ 220
Cornish pasty | pasty, cornish pasty, cheese and onion pasty, steak pasty | 260 6.5 24 15.5 | 1 pasty ~ 225
Pastry bake (steak or chicken) | steak bake, chicken bake, sausage and bean melt, cheese and onion bake | 300 9.5 26 17.5 | 1 bake = 135
Quiche | quiche, quiche lorraine | 270 9 18 18 | slice 100
Soup, tomato or vegetable | soup, tomato soup, vegetable soup, veg soup, minestrone, leek and potato soup, carrot and coriander soup, mushroom soup | 48 1 7.5 1.5 | ml; tin 400; bowl 300
Soup, chicken or meat | chicken soup, cream of chicken soup, chicken noodle soup, scotch broth, oxtail soup | 50 2.5 5 2.2 | ml; tin 400; bowl 300
Soup, lentil or bean | lentil soup, bean soup, pea and ham soup, lentil and bacon soup | 60 3.5 9 1 | ml; tin 400; bowl 300
Sandwich (shop-bought, typical) | sandwich, meal deal sandwich, butty, sarnie | 205 10.5 20 8.7 | 1 sandwich ~ 190
Sandwich, chicken, ham or turkey salad | chicken sandwich, ham sandwich, turkey sandwich, chicken salad sandwich, ham salad sandwich, prawn sandwich | 184 11.6 20 5.8 | 1 sandwich ~ 190
Sandwich, cheese, egg mayo, bacon or sausage | cheese sandwich, egg mayo sandwich, blt, bacon sandwich, sausage sandwich, bacon butty, bacon roll, sausage bap, egg sandwich, cheese and pickle sandwich, ham and cheese sandwich, tuna mayo sandwich, tuna sandwich, cheese and ham toastie, toastie, cheese toastie, panini | 226 9.5 20 11.6 | 1 sandwich ~ 190
Filled wrap (shop-bought) | chicken wrap, filled wrap, chicken caesar wrap, falafel wrap, fajita, chicken fajita | 210 11 22 8.3 | 1 wrap ~ 200
Sub, 6-inch (chicken or turkey) | sub, subway, 6 inch sub, six inch sub | 139 9.6 18.3 2.6 | 1 sub ~ 230
Burrito | burrito, chicken burrito, beef burrito | 165 9 19 5.5 | 1 burrito ~ 450
Full English breakfast | full english, full english breakfast, fry up, cooked breakfast, big breakfast | 196 9.6 12.9 11.9 | 1 breakfast ~ 480
Beans on toast | beans on toast | 139 5.6 20.3 3.2 +6 | 1 portion ~ 310
Cheese on toast | cheese on toast | 314 16 25.7 16 | 1 portion ~ 140

# Sports nutrition
Whey protein powder | whey, whey protein, protein powder, impact whey | 400 78 6 7 | scoop 30
Protein bar | protein bar, grenade bar, grenade, carb killa, barebells, fulfil bar, quest bar | 365 33 28 15 | 1 bar ~ 60
Energy gel | energy gel, gel, sis gel, isotonic gel | 145 0 36 0 | 1 gel = 60
Sports drink | sports drink, lucozade sport, isotonic drink, powerade, gatorade | 27 0 6.5 0 | ml; bottle 500
Energy drink | energy drink, red bull, monster, relentless | 46 0 11 0 | ml; can 250
Carb powder (maltodextrin or dextrose) | carb powder, maltodextrin, dextrose, cyclic dextrin, glucose powder | 380 0 95 0 | scoop 30; tbsp 10
Creatine | creatine | 0 0 0 0 | scoop 5; tsp 5
`;

/* the words for a count of something, each as the one word it's kept
   under: "2 cans", "a tin", "3 slices" */
const UNIT_WORDS = {
  tin: "tin tins can cans", pouch: "pouch pouches", bottle: "bottle bottles", sachet: "sachet sachets", slice: "slice slices",
  piece: "piece pieces", portion: "portion portions serving servings", tbsp: "tbsp tbsps tablespoon tablespoons", tsp: "tsp tsps teaspoon teaspoons",
  scoop: "scoop scoops", handful: "handful handfuls", pint: "pint pints", glass: "glass glasses", mug: "mug mugs cup cups", bowl: "bowl bowls",
  pot: "pot pots tub tubs", pack: "pack packs packet packets bag bags", bar: "bar bars", square: "square squares", ball: "ball balls",
  jar: "jar jars", shot: "shot shots", x: "x",
};
export const UNIT = Object.create(null);          // no inherited names: a typed "constructor" is not a word for an amount
Object.keys(UNIT_WORDS).forEach((u) => UNIT_WORDS[u].split(" ").forEach((w) => { UNIT[w] = u; }));
export const unitOf = (w) => UNIT[String(w || "").toLowerCase()] || null;

const slug = (s) => String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const STATES = ["std", "raw", "cooked", "dry"];

/* The table read into foods. A line that can't be read is left out — or,
   with `strict`, stops the reading and names itself (the tests read it
   that way, so a line that's wrong never ships). */
export function parseList(text, strict) {
  const out = []; let grp = "";
  String(text).split("\n").forEach((line, i) => {
    const s = line.trim();
    if (!s) return;
    if (s[0] === "#") { grp = s.slice(1).trim(); return; }
    try {
      const c = s.split("|").map((x) => x.trim());
      if (c.length < 3 || c.length > 4 || !c[0] || !c[1]) throw new Error("its parts");
      const f = { id: "f-" + slug(c[0]), n: c[0], keys: c[1].split(",").map((k) => k.trim().toLowerCase()).filter(Boolean), grp };
      c[2].split(";").forEach((g) => {
        const w = g.trim().split(/\s+/);
        const st = /^[a-z]/.test(w[0]) ? w.shift() : "std";
        const plus = w.filter((x) => x[0] === "+").map((x) => Number(x.slice(1)));
        const nums = w.filter((x) => x[0] !== "+").map(Number);
        if (STATES.indexOf(st) < 0 || f[st] || nums.length !== 4 || nums.some((x) => !(x >= 0)) || plus.length > 1 || plus.some((x) => !(x > 0))) throw new Error("its numbers");
        f[st] = nums;
        if (plus.length) { f.plus = f.plus || {}; f.plus[st] = plus[0]; }
      });
      if (f.std && (f.raw || f.cooked || f.dry)) throw new Error("its numbers");
      (c[3] || "").split(";").map((x) => x.trim()).filter(Boolean).forEach((p) => {
        let m;
        if (p === "ml") f.liquid = true;
        else if ((m = p.match(/^(1|per) ([a-z][a-z ]*?) (=|~) (\d+(?:\.\d+)?)$/)) && !f.each && !(m[1] === "per" && m[3] === "=")) f.each = Object.assign({ g: Number(m[4]), w: m[2] }, m[3] === "~" ? { about: true } : {}, m[1] === "per" ? { ask: true } : {});
        else if ((m = p.match(/^([a-z]+) (\d+(?:\.\d+)?)$/)) && unitOf(m[1])) { f.unit = f.unit || {}; f.unit[unitOf(m[1])] = Number(m[2]); }
        else throw new Error("its portions");
      });
      out.push(f);
    } catch (e) { if (strict) throw new Error("The food list, line " + (i + 1) + " (" + s.slice(0, 40) + "): " + e.message); }
  });
  return out;
}

export const LIST = parseList(TABLE);
/* the groups, in the table's order */
export const GROUPS = LIST.reduce((a, f) => (a.indexOf(f.grp) < 0 ? a.concat([f.grp]) : a), []);
