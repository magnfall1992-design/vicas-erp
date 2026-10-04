/* Données de démonstration VICAS — FICTIVES (montants, noms des agents et références sont illustratifs).
   vicasDemo(dateISO) renvoie {collection: [documents]} relatif à la date donnée. */
function vicasDemo(todayISO){
  const T = new Date(todayISO+"T12:00:00");
  const d = n => { const x=new Date(T); x.setDate(x.getDate()+n); return x.toISOString().slice(0,10); };
  const M = 1e6;
  const now = new Date(T).toISOString();
  const H = (q,txt,n=0)=>({d:d(n),qui:q,quoi:txt});

  const config = [{ id:"main", seededAt: now, version:1,
    seuils:{S0:25000,S1:250000,S2:1000000,S3:5000000,SF:2000000},
    seuilTresorerie: 150*M, slaHeures:48,
    entreprise:"VICAS S.A.R.L.", demo:true }];

  const P = (id,code,intitule,client,type,localite,chef,montant,debut,fin,phys,dep,fac,enc,statut,risque,jalons,histo)=>({
    id,code,intitule,client,type,localite,chef,montant:montant*M,avenants:0,dateDebut:debut,dateFin:fin,
    avancement:phys,depenses:dep*M,facture:fac*M,encaisse:enc*M,statut,risque,jalons,
    histAv:histo.map(x=>[x[0],Math.round(x[1]*phys/(histo[histo.length-1][1]||1))]), hist:[H("Système","Projet importé (données de démonstration)",-60)]});

  const projets = [
    P("p1","P-2025-014","Réhabilitation et extension du réseau d'assainissement de Kaolack — lot 2","ONAS","Assainissement","Kaolack","S. Gueye",1850,"2025-11-15","2027-02-28",63,1080,1110,960,"En cours","Moyen",
      [{n:"Collecteur principal Médina Baye",d:"2026-06-30",f:true},{n:"Station de pompage SP2",d:"2026-11-30",f:false},{n:"Branchements sociaux (1 200)",d:"2027-01-31",f:false}],
      [[d(-150),22],[d(-120),27],[d(-90),33],[d(-60),38],[d(-30),42],[d(0),46]]),
    P("p2","P-2026-003","Construction de la station de traitement des boues de vidange (STBV) de Thiès","ONAS","BTP","Thiès","A. Sy",1240,"2026-02-01","2027-01-31",55,830,650,572,"En cours","Élevé",
      [{n:"Terrassements et lits de séchage",d:"2026-07-31",f:true},{n:"Génie civil bassins",d:"2026-12-15",f:false},{n:"Équipements et mise en service",d:"2027-01-31",f:false}],
      [[d(-150),3],[d(-120),8],[d(-90),14],[d(-60),19],[d(-30),24],[d(0),28]]),
    P("p3","P-2026-007","Curage et hydrocurage des collecteurs — Dakar Plateau et Médina","ONAS","Exploitation","Dakar","M. Diop",420,"2026-01-10","2026-12-31",71,250,290,205,"En cours","Faible",
      [{n:"Campagne pré-hivernage",d:"2026-06-15",f:true},{n:"Campagne post-hivernage",d:"2026-11-15",f:false}],
      [[d(-150),25],[d(-120),36],[d(-90),49],[d(-60),58],[d(-30),65],[d(0),71]]),
    P("p4","P-2026-011","Maintenance privative des réseaux — zone touristique de Saly","SAPCO","Exploitation","Saly","M. Diop",165,"2026-03-01","2027-02-28",57,74,86,86,"En cours","Faible",
      [{n:"Diagnostic caméra des réseaux",d:"2026-05-31",f:true},{n:"Plan de maintenance préventive",d:"2026-07-31",f:true}],
      [[d(-150),8],[d(-120),17],[d(-90),27],[d(-60),36],[d(-30),44],[d(0),52]]),
    P("p5","P-2026-015","Assainissement autonome — 600 ouvrages individuels à Rufisque","AGETIP","Assainissement","Rufisque","S. Gueye",690,"2026-05-01","2027-04-30",18,140,95,0,"En cours","Élevé",
      [{n:"Enquêtes ménages et implantation",d:"2026-07-15",f:true},{n:"150 premiers ouvrages",d:"2026-09-30",f:false},{n:"Réception partielle (300)",d:"2026-12-31",f:false}],
      [[d(-120),2],[d(-90),5],[d(-60),9],[d(-30),14],[d(0),18]]),
    P("p6","P-2026-019","VRD et réseau d'eaux usées — ZES de Sandiara, tranche 1","DELTA SA","BTP","Sandiara","A. Sy",980,"2026-07-15","2027-07-14",17,150,98,98,"En cours","Moyen",
      [{n:"Installation de chantier",d:"2026-08-15",f:true},{n:"Réseau EU voies primaires",d:"2027-01-31",f:false}],
      [[d(-60),1],[d(-30),5],[d(0),9]]),
    P("p7","P-2026-021","Collecte et valorisation des huiles usagées — contrat annuel","Client privé (secteur pétrolier)","Huiles usagées","Dakar","K. Ndour",96,"2026-01-01","2026-12-31",74,48,70,63,"En cours","Faible",
      [{n:"Collecte T1-T2",d:"2026-06-30",f:true},{n:"Collecte T3",d:"2026-09-30",f:true}],
      [[d(-150),33],[d(-120),41],[d(-90),49],[d(-60),58],[d(-30),66],[d(0),74]]),
    P("p8","P-2025-009","Réseau d'égouts du lotissement de Diamniadio","Promoteur immobilier (privé)","BTP","Diamniadio","A. Sy",310,"2025-06-01","2026-08-31",100,262,295,248,"Réception provisoire","Faible",
      [{n:"Réception provisoire",d:"2026-09-05",f:true},{n:"Levée des réserves",d:"2026-10-20",f:false}],
      [[d(-150),78],[d(-120),86],[d(-90),93],[d(-60),98],[d(-30),100],[d(0),100]])
  ];
  projets[1].hist.push(H("A. Sy","Retard de livraison des aciers HA — fournisseur relancé",-12));
  projets[4].hist.push(H("S. Gueye","Démarrage lent : accès aux parcelles difficile, 2e équipe mobilisée",-9));

  const offres = [
    {id:"o1",ref:"AO ONAS n°2026/045",intitule:"Hydrocurage des réseaux de Pikine et Guédiawaye",client:"ONAS",montant:380*M,dateLimite:d(6),statut:"En préparation",responsable:"F. Ba",probabilite:50},
    {id:"o2",ref:"AO AGEROUTE n°112",intitule:"Assainissement pluvial de Mbour — lot 1",client:"AGEROUTE",montant:1120*M,dateLimite:d(14),statut:"En préparation",responsable:"F. Ba",probabilite:35},
    {id:"o3",ref:"Consultation 26-031",intitule:"Vidange des sites techniques (contrat 3 ans)",client:"Opérateur télécom",montant:54*M,dateLimite:d(-10),statut:"Soumise",responsable:"F. Ba",probabilite:60},
    {id:"o4",ref:"AO Commune de Ziguinchor",intitule:"Extension de la STBV de Ziguinchor",client:"Commune de Ziguinchor",montant:760*M,dateLimite:d(-21),statut:"Soumise",responsable:"A. Sy",probabilite:40},
    {id:"o5",ref:"Consultation PAD-2026-08",intitule:"Maintenance des réseaux privatifs du port",client:"Port autonome de Dakar",montant:210*M,dateLimite:d(-34),statut:"Gagnée",responsable:"F. Ba",probabilite:100},
    {id:"o6",ref:"AO Ville de Saint-Louis",intitule:"Curage des canaux à ciel ouvert",client:"Ville de Saint-Louis",montant:140*M,dateLimite:d(-45),statut:"Perdue",responsable:"F. Ba",probabilite:0},
    {id:"o7",ref:"Demande directe",intitule:"Gestion déléguée des boues — Kaolack & Thiès (PPP)",client:"État du Sénégal / partenaires",montant:2450*M,dateLimite:d(28),statut:"En préparation",responsable:"Direction Générale",probabilite:30}
  ];
  offres.forEach(o=>o.hist=[H("F. Ba","Offre enregistrée",-40)]);

  const E=(id,code,type,marque,immat,statut,affect,chauffeur,compteur,unite,prochain,loc,depuis,cout)=>({id,code,type,marque,immat,statut,affectation:affect,chauffeur,compteur,unite,prochainEntretien:prochain,localisation:loc,depuis:d(depuis),coutMois:cout*1000,hist:[]});
  const engins = [
    E("e1","HC-01","Hydrocureur","Mercedes Actros","DK-4512-BF","En mission","p3","I. Faye",182400,"km",185000,"Dakar Plateau",-3,1450),
    E("e2","HC-02","Hydrocureur","Mercedes Actros","DK-4513-BF","En mission","p3","B. Cisse",176900,"km",180000,"Médina",-3,1380),
    E("e3","HC-03","Hydrocureur","Renault Kerax","DK-7781-BG","En panne","","—",241000,"km",240000,"Atelier Hann",-6,2100),
    E("e4","HC-04","Hydrocureur","Iveco Trakker","TH-1208-B","En mission","p4","O. Ndiaye",98500,"km",100000,"Saly",-12,1120),
    E("e5","HC-05","Hydrocureur","Iveco Trakker","TH-1209-B","Disponible","","A. Diallo",101300,"km",110000,"Dépôt Rufisque",-1,980),
    E("e6","HC-06","Hydrocureur","MAN TGS","DK-2290-BH","En mission","p1","P. Gomis",65400,"km",70000,"Kaolack",-20,1050),
    E("e7","HC-07","Hydrocureur","MAN TGS","DK-2291-BH","En entretien","","—",69900,"km",70000,"Atelier Hann",-2,1600),
    E("e8","HC-08","Hydrocureur combiné","Scania P410","DK-9902-BJ","En mission","p6","M. Sow",21800,"km",30000,"Sandiara",-30,1250),
    E("e9","CV-01","Camion de vidange 10 m³","Mercedes Axor","DK-3301-AX","En mission","vidange","D. Kane",210300,"km",215000,"Parcelles Assainies",0,760),
    E("e10","CV-02","Camion de vidange 10 m³","Mercedes Axor","DK-3302-AX","En mission","vidange","S. Diatta",198700,"km",200000,"Keur Massar",0,740),
    E("e11","CV-03","Camion de vidange 12 m³","Renault Midlum","DK-5540-BA","Disponible","","A. Mbaye",143200,"km",150000,"Dépôt Pikine",0,690),
    E("e12","CV-04","Camion de vidange 12 m³","Renault Midlum","DK-5541-BA","En mission","p5","C. Sarr",139900,"km",140000,"Rufisque",-5,710),
    E("e13","CV-05","Camion de vidange 8 m³","Isuzu FVR","DK-6620-BB","En panne","","—",250100,"km",245000,"Atelier Hann",-4,1300),
    E("e14","CV-06","Camion de vidange 8 m³","Isuzu FVR","DK-6621-BB","En mission","vidange","Y. Toure",188000,"km",195000,"Guédiawaye",0,700),
    E("e15","CV-07","Camion de vidange 10 m³","DAF CF","TH-3310-C","En mission","p1","L. Diouf",77000,"km",80000,"Kaolack",-15,650),
    E("e16","CV-08","Camion de vidange 10 m³","DAF CF","TH-3311-C","Disponible","","N. Fall",80200,"km",90000,"Dépôt Thiès",-2,640),
    E("e17","PM-01","Pelle mécanique 20 t","Caterpillar 320","—","En mission","p2","R. Badji",8450,"h",8500,"Thiès",-40,2300),
    E("e18","PM-02","Pelle mécanique 20 t","Komatsu PC210","—","En mission","p6","E. Mendy",5210,"h",5500,"Sandiara",-30,2150),
    E("e19","PM-03","Mini-pelle 5 t","Kubota KX057","—","En mission","p5","T. Sene",2380,"h",2500,"Rufisque",-25,780),
    E("e20","PM-04","Chargeuse-pelleteuse","JCB 3CX","—","En panne","","—",9900,"h",9800,"Kaolack",-9,1900),
    E("e21","CB-01","Camion benne 20 m³","Renault Kerax","DK-1180-AZ","En mission","p2","F. Dieng",302000,"km",305000,"Thiès",-40,1150),
    E("e22","CB-02","Camion benne 20 m³","Sinotruk Howo","DK-8870-BE","En mission","p6","G. Thiam",88000,"km",90000,"Sandiara",-30,980),
    E("e23","CB-03","Camion benne 16 m³","Sinotruk Howo","DK-8871-BE","Disponible","","H. Ka",91000,"km",100000,"Dépôt Rufisque",-3,900),
    E("e24","CB-04","Camion benne 16 m³","Mercedes Actros","DK-4100-AT","En mission","p1","J. Niang",265000,"km",270000,"Kaolack",-20,1180),
    E("e25","VL-01","Pick-up de liaison","Toyota Hilux","DK-0112-BK","En mission","p1","S. Gueye",120300,"km",125000,"Kaolack",-20,310),
    E("e26","VL-02","Pick-up de liaison","Toyota Hilux","DK-0113-BK","En mission","p2","A. Sy",98200,"km",100000,"Thiès",-10,290),
    E("e27","VL-03","Pick-up de liaison","Mitsubishi L200","DK-0420-BL","Disponible","","—",64000,"km",70000,"Siège",0,250),
    E("e28","VL-04","Véhicule de direction","Toyota Land Cruiser","DK-0001-VC","En mission","","Chauffeur DG",45000,"km",50000,"Siège",0,420),
    E("e29","MP-01","Motopompe 150 m³/h","Varisco","—","En mission","p3","—",3100,"h",3250,"Médina",-8,180),
    E("e30","MP-02","Groupe électrogène 100 kVA","SDMO","—","Disponible","","—",6100,"h",6500,"Dépôt Rufisque",-1,150),
    E("e31","HU-01","Citerne huiles usagées 15 m³","Renault Premium","DK-7150-BD","En mission","p7","W. Sy",233000,"km",235000,"Zone industrielle",0,820)
  ];
  engins.find(e=>e.id==="e3").panne="Pompe haute pression HS — pièce commandée (délai 10 j)";
  engins.find(e=>e.id==="e13").panne="Embrayage — attente devis atelier";
  engins.find(e=>e.id==="e20").panne="Fuite vérin hydraulique";
  engins.find(e=>e.id==="e7").panne="Vidange 70 000 km + freins";

  const comptes = [
    {id:"c1",nom:"CBAO — compte courant",type:"Banque",soldeOuverture:396*M,dateOuverture:d(-30)},
    {id:"c2",nom:"Société Générale Sénégal",type:"Banque",soldeOuverture:171*M,dateOuverture:d(-30)},
    {id:"c3",nom:"Ecobank — compte projets",type:"Banque",soldeOuverture:62*M,dateOuverture:d(-30)},
    {id:"c4",nom:"Caisse siège",type:"Caisse",soldeOuverture:2.4*M,dateOuverture:d(-30)},
    {id:"c5",nom:"Wave Business",type:"Mobile money",soldeOuverture:4.1*M,dateOuverture:d(-30)},
    {id:"c6",nom:"Orange Money marchand",type:"Mobile money",soldeOuverture:1.6*M,dateOuverture:d(-30)}
  ];
  let mi=0;
  const MV=(c,j,lib,mt,cat,statut,rap)=>({id:"m"+(++mi),compteId:c,date:d(j),libelle:lib,montant:Math.round(mt*M),categorie:cat,statut,rapproche:rap});
  const mouvements = [
    MV("c1",-28,"Encaissement décompte n°6 — Kaolack lot 2 (ONAS)",145,"Encaissement client","Réalisé",true),
    MV("c1",-27,"Salaires septembre",-86,"Salaires","Réalisé",true),
    MV("c2",-25,"Carburant — Total Energies (bons septembre)",-31.5,"Carburant","Réalisé",true),
    MV("c1",-24,"CNSS / IPRES septembre",-14.2,"Charges sociales","Réalisé",true),
    MV("c3",-22,"Fournisseur aciers HA — STBV Thiès",-48,"Fournisseur","Réalisé",true),
    MV("c2",-20,"Encaissement SAPCO — maintenance Saly (T2)",41,"Encaissement client","Réalisé",true),
    MV("c1",-18,"Échéance crédit-bail hydrocureurs",-12.6,"Financement","Réalisé",true),
    MV("c5",-17,"Vidanges particuliers (Wave) — semaine 38",3.9,"Vidange","Réalisé",true),
    MV("c4",-16,"Frais de mission chantier Kaolack",-0.9,"Frais généraux","Réalisé",true),
    MV("c2",-15,"Pièces détachées — atelier",-7.8,"Maintenance flotte","Réalisé",true),
    MV("c1",-14,"Encaissement ZES Sandiara — avance de démarrage",98,"Encaissement client","Réalisé",true),
    MV("c3",-12,"Ciment et agrégats — Rufisque",-22,"Fournisseur","Réalisé",false),
    MV("c6",-11,"Vidanges particuliers (Orange Money) — semaine 39",1.7,"Vidange","Réalisé",true),
    MV("c2",-10,"TVA septembre",-18.4,"Impôts et taxes","Réalisé",true),
    MV("c5",-9,"Vidanges particuliers (Wave) — semaine 39",4.4,"Vidange","Réalisé",false),
    MV("c1",-8,"Encaissement huiles usagées (acompte T3)",21,"Encaissement client","Réalisé",true),
    MV("c2",-6,"Location grue — STBV Thiès",-9.5,"Sous-traitance","Réalisé",false),
    MV("c4",-5,"Approvisionnement caisse",1.5,"Virement interne","Réalisé",true),
    MV("c1",-5,"Virement vers caisse",-1.5,"Virement interne","Réalisé",true),
    MV("c3",-3,"Sous-traitant maçonnerie — Rufisque",-16,"Sous-traitance","Réalisé",false),
    MV("c5",-2,"Vidanges particuliers (Wave) — semaine 40",4.1,"Vidange","Réalisé",false),
    MV("c2",-1,"Assurance flotte — trimestre 4",-11.2,"Assurances","Réalisé",false),
    // prévisions
    MV("c1",4,"Carburant — bons octobre",-33,"Carburant","Prévu",false),
    MV("c1",8,"Échéance crédit-bail hydrocureurs",-12.6,"Financement","Prévu",false),
    MV("c2",12,"TVA octobre (estimation)",-19,"Impôts et taxes","Prévu",false),
    MV("c1",25,"Salaires octobre",-88,"Salaires","Prévu",false),
    MV("c1",27,"CNSS / IPRES octobre",-14.5,"Charges sociales","Prévu",false),
    MV("c1",38,"Échéance crédit-bail hydrocureurs",-12.6,"Financement","Prévu",false),
    MV("c1",35,"Carburant — bons novembre",-34,"Carburant","Prévu",false),
    MV("c3",45,"Équipements STBV Thiès — acompte 30 %",-95,"Fournisseur","Prévu",false),
    MV("c1",56,"Salaires novembre",-88,"Salaires","Prévu",false),
    MV("c1",58,"CNSS / IPRES novembre",-14.5,"Charges sociales","Prévu",false),
    MV("c1",66,"Carburant — bons décembre",-35,"Carburant","Prévu",false),
    MV("c1",69,"Échéance crédit-bail hydrocureurs",-12.6,"Financement","Prévu",false),
    MV("c1",84,"Salaires décembre + gratifications",-112,"Salaires","Prévu",false)
  ];

  let fi=0;
  const FC=(num,tiers,p,lib,mt,em,ech,paye)=>({id:"f"+(++fi),sens:"client",numero:num,tiers,projetId:p,libelle:lib,montant:mt*M,dateEmission:d(em),echeance:d(ech),paye:paye*M,statut:paye>=mt?"Payée":(paye>0?"Partiellement payée":"Émise"),hist:[H("Comptabilité","Facture émise",em)]});
  const FF=(num,tiers,p,mt,em,ech,statut,lib,etape)=>({id:"f"+(++fi),sens:"fournisseur",numero:num,tiers,projetId:p,libelle:lib,montant:mt*M,dateEmission:d(em),echeance:d(ech),paye:statut==="Payée"?mt*M:0,statut,etape:etape||0,hist:[H("Service Achats","Facture enregistrée",em)]});
  const factures = [
    FC("FV-2026-118","ONAS","p1","Décompte n°7 — Kaolack lot 2",150,-38,-8,0,"Décompte n°7"),
    FC("FV-2026-121","ONAS","p3","Situation n°8 — curage Plateau/Médina",85,-52,-22,0,"Situation n°8"),
    FC("FV-2026-125","AGETIP","p5","Décompte n°1 — Rufisque",95,-30,15,0,"Décompte n°1"),
    FC("FV-2026-127","Promoteur immobilier (privé)","p8","Solde marché — Diamniadio",47,-25,5,0,"Solde marché"),
    FC("FV-2026-129","ONAS","p2","Décompte n°4 — STBV Thiès",78,-12,48,0,"Décompte n°4"),
    FC("FV-2026-130","Client privé (secteur pétrolier)","p7","Collecte T3",14,-6,24,7,"Collecte T3"),
    FC("FV-2026-131","SAPCO","p4","Maintenance Saly — T3",41,-4,26,0,"Maintenance T3"),
    FC("FV-2026-110","ONAS","p1","Décompte n°6 — Kaolack lot 2",145,-70,-40,145,"Décompte n°6"),
    FF("FA-0921","Quincaillerie industrielle Dakar","p2",3.85,-9,21,"À valider","Aciers et fixations — STBV",0),
    FF("FA-0924","Atelier mécanique Hann","",6.2,-7,23,"À valider","Réparation HC-03 (pompe HP)",1),
    FF("FA-0925","Location d'engins (sous-traitant)","p6",12.4,-6,24,"À valider","Location niveleuse septembre",1),
    FF("FA-0926","Fournisseur PVC assainissement","p1",28.7,-5,25,"À valider","Tuyaux PVC DN 400 — lot 3",2),
    FF("FA-0927","Imprimerie","",0.48,-4,26,"À valider","Carnets de bons de vidange",0),
    FF("FA-0915","Carburant — distributeur","",31.5,-26,4,"Validée","Bons carburant septembre",3),
    FF("FA-0918","Sous-traitant maçonnerie","p5",16,-15,-3,"Payée","Maçonnerie fosses — lot A",3)
  ];

  let ri=0;
  const R=(type,objet,demandeur,service,montant,projet,j,etape,statut,motif)=>({id:"r"+(++ri),num:"RQ-"+String(1040+ri),type,objet,demandeur,service,montant,projetId:projet,date:d(j),creeLe:new Date(T.getTime()+j*864e5-3*3600e3).toISOString(),etape,statut,motif:motif||"",hist:[H(demandeur,"Demande créée",j)]});
  const requetes = [
    R("Paiement fournisseur","Acompte 30 % équipements STBV Thiès (dégrilleurs, pompes)","A. Sy","Chantiers",95*M,"p2",-2,2,"En attente"),
    R("Achat / prestation","Pièce pompe haute pression HC-03 (importation)","O. Sarr","Parc",8.4*M,"",-4,2,"En attente"),
    R("Avenant projet","Avenant n°1 : prolongation de 2 mois — Rufisque (accès parcelles)","S. Gueye","Chantiers",42*M,"p5",-3,1,"En attente"),
    R("Avance sur salaire","Avance sur salaire — 2 mois","L. Mendy","Exploitation",300000,"",-1,1,"En attente"),
    R("Mission / véhicule","Pick-up pour mission de contrôle Kaolack (3 jours)","K. Faye","RH",120000,"",-1,0,"En attente"),
    R("Achat / prestation","Équipements de protection individuelle — 60 kits","M. Diop","Exploitation",2.7*M,"p3",-5,2,"En attente"),
    R("Paiement fournisseur","Règlement sous-traitant terrassement — Sandiara","A. Sy","Chantiers",18.5*M,"p6",-6,2,"En attente"),
    R("Carburant","Dotation carburant complémentaire — campagne curage","M. Diop","Exploitation",1.8*M,"p3",0,0,"En attente"),
    R("Fournitures","Ramettes de papier et cartouches","Assistante DG","Direction",18000,"",-1,0,"Exécutée"),
    R("Congé","Congé annuel — 15 jours","T. Sene","Chantiers",0,"",-8,1,"Validée"),
    R("Achat / prestation","Caméra d'inspection de réseaux","M. Diop","Exploitation",14.5*M,"",-12,3,"Rejetée","Budget investissement 2027"),
    R("Paiement fournisseur","Location grue STBV Thiès","A. Sy","Chantiers",9.5*M,"p2",-14,3,"Validée")
  ];

  let vi=0;
  const V=(client,tel,quartier,ville,volume,distance,j,statut,engin,paiement,paye)=>{const prix=2000+5000+volume*1500+distance*500;return{id:"v"+(++vi),num:"VD-"+String(3200+vi),client,tel,quartier,ville,volume,distance,prix,date:d(j),statut,enginId:engin,paiement,paye}};
  const interventions = [
    V("Fatou Ndiaye","77 512 34 10","Parcelles Assainies U17","Dakar",10,14,0,"En cours","e9","Wave",false),
    V("Résidence Les Almadies","33 820 11 45","Almadies","Dakar",12,22,0,"En cours","e10","Facture",false),
    V("Omar Sall","78 221 90 03","Keur Massar","Pikine",8,9,0,"En cours","e14","Orange Money",false),
    V("École Sainte-Marie","33 834 22 10","Grand Yoff","Dakar",10,11,1,"Planifiée","e11","Facture",false),
    V("Aminata Sow","76 330 12 98","Guédiawaye","Guédiawaye",8,6,1,"Planifiée","e14","Wave",false),
    V("Mamadou Ba","77 800 55 41","Yeumbeul","Pikine",6,8,0,"Nouvelle","","Espèces",false),
    V("Hôtel Teranga Saly","33 957 40 40","Saly Portudal","Mbour",12,4,2,"Nouvelle","","Facture",false),
    V("Ibrahima Diallo","70 411 27 66","Mbao","Pikine",10,10,-1,"Terminée","e11","Wave",true),
    V("Clinique du Point E","33 869 00 12","Point E","Dakar",12,15,-1,"Terminée","e9","Facture",false),
    V("Seynabou Diop","77 650 18 23","Thiaroye","Pikine",8,7,-2,"Terminée","e10","Orange Money",true),
    V("Moussa Kane","78 902 33 45","Rufisque Est","Rufisque",10,12,-2,"Terminée","e16","Espèces",true)
  ];

  return {config,projets,offres,engins,comptes,mouvements,factures,requetes,interventions};
}
if (typeof module!=="undefined") module.exports={vicasDemo};
