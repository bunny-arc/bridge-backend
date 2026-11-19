// 3. STATE MANAGEMENT & RESERVATION MULTIPLIERS
    // =========================================================================
    function getCollegeCardLocation(c) {
      if (typeof window !== "undefined" && typeof window.getCollegeCardLocation === "function") {
        return window.getCollegeCardLocation(c);
      }
      if (!c) return "Andhra Pradesh";
      if (c.location && typeof c.location === "string" && c.location.trim().length > 0 && c.location.trim() !== "India") {
        return c.location.trim();
      }
      if (c.city && c.state) return `${c.city}, ${c.state}`;
      if (c.district && c.state) return `${c.district}, ${c.state}`;
      if (c.district && c.district.trim().length > 0 && c.district !== "All 26 AP Districts") return `${c.district}, AP`;
      if (c.city && c.city.trim().length > 0) return `${c.city}`;
      if (c.state && c.state.trim().length > 0 && c.state !== "ALL") return `${c.state}`;
      if (c.region && c.region !== "National" && c.region !== "ALL") return `${c.region} Region, AP`;
      return "Andhra Pradesh";
    }

    const categoryMultipliers = {
      OC: 1.0,
      EWS: 1.18,
      BC_A: 1.48,
      BC_B: 1.38,
      BC_C: 1.65,
      BC_D: 1.36,
      BC_E: 1.55,
      SC: 2.35,
      ST: 2.75
    };

    const categoryLabels = {
      OC: "OC (General)",
      EWS: "EWS Quota",
      BC_A: "BC-A Quota",
      BC_B: "BC-B Quota",
      BC_C: "BC-C Quota",
      BC_D: "BC-D Quota",
      BC_E: "BC-E Quota",
      SC: "SC Quota",
      ST: "ST Quota"
    };

    const originHubOffsets = {
      Bengaluru: { label: "Bengaluru", svuDist: "~185 – 260 km", auDist: "~630 – 1,010 km", svuTime: "3.5 – 5.5 hrs", auTime: "10 – 17 hrs" },
      Vijayawada: { label: "Vijayawada", svuDist: "~340 – 450 km", auDist: "~15 – 350 km", svuTime: "6 – 8 hrs", auTime: "0.5 – 6 hrs" },
      Visakhapatnam: { label: "Visakhapatnam", svuDist: "~680 – 790 km", auDist: "~10 – 350 km", svuTime: "11 – 14 hrs", auTime: "0.5 – 6 hrs" },
      Tirupati: { label: "Tirupati", svuDist: "~10 – 220 km", auDist: "~380 – 750 km", svuTime: "0.5 – 4.5 hrs", auTime: "6.5 – 13 hrs" },
      Hyderabad: { label: "Hyderabad", svuDist: "~310 – 520 km", auDist: "~275 – 620 km", svuTime: "5 – 9 hrs", auTime: "4.5 – 11 hrs" },
      Chennai: { label: "Chennai", svuDist: "~135 – 390 km", auDist: "~430 – 790 km", svuTime: "2.5 – 7 hrs", auTime: "7 – 13.5 hrs" }
    };

    const checklistDocsData = [
      { id: "doc_rank", title: "AP EAPCET / JEE Rank Card & Hall Ticket (2025/2026)", desc: "Download 4 copies from official APSCHE cets.apsche.ap.gov.in or NTA portal." },
      { id: "doc_ssc", title: "SSC / 10th Class Marks Memo (Date of Birth Proof)", desc: "Original certificate + 3 xerox sets for age and name verification." },
      { id: "doc_inter", title: "Intermediate (10+2 MPC) Marks Memo-cum-Pass Certificate", desc: "Issued by BIEAP / CBSE / ICSE showing PCM aggregate marks." },
      { id: "doc_study", title: "Study Certificates from Class 6th to Intermediate (7 Years)", desc: "Mandatory to establish your 85% Local Area (AU or SVU region) eligibility." },
      { id: "doc_tc", title: "Transfer Certificate (TC) from Junior College", desc: "Original TC must be submitted at the allotted engineering college." },
      { id: "doc_income", title: "Latest Income Certificate (< ₹2.5L) or White Ration / Rice Card", desc: "Issued on/after Jan 1st from Grama/Ward Sachivalayam for 100% JVD Fee Reimbursement." },
      { id: "doc_caste", title: "Integrated Caste Certificate (SC / ST / BC-A/B/C/D/E) or EWS Certificate", desc: "Issued by Tahsildar / MeeSeva with verifiable barcode for reservation scaling." },
      { id: "doc_residence", title: "Residence / Local Status Certificate (If Private Study)", desc: "Required only for candidates who studied privately or migrated from Telangana." },
      { id: "doc_aadhaar", title: "Student & Mother Aadhaar Card + NPCI Bank Account Link", desc: "Active bank account linked with Aadhaar for JVD & Vasathi Deevena direct credit." }
    ];

    let appState = {
      activeView: "explore",
      exam: "ap_cet",
      jeeRankMode: "air", // "air" (All India Rank) or "general" (General / Category Rank)
      rank: null,
      category: "OC",
      region: "ALL",
      district: "ALL",
      branch: "ALL",
      state: "Andhra Pradesh",
      selectedStates: ["Andhra Pradesh"],
      type: "ALL",
      minPkg: 0,
      search: "",
      sortBy: "rank_asc",
      onlyEligible: true,
      hideLowPlacement: false,
      originHub: "Bengaluru",
      pageSize: 18,
      currentLimit: 18,
      priorityList: [],
      shortlist: [],
      checkedDocs: {},
      activeModalCollegeId: null
    };

    try {
      const savedPriority = localStorage.getItem("i2t_priority_v8");
      if (savedPriority) appState.priorityList = JSON.parse(savedPriority);
      try { localStorage.removeItem("i2t_shortlist_v8"); } catch (e) {}
      const savedShortlist = localStorage.getItem("i2t_favorites_v9");
      if (savedShortlist) appState.shortlist = JSON.parse(savedShortlist);
      const savedDocs = localStorage.getItem("i2t_docs_v8");
      if (savedDocs) appState.checkedDocs = JSON.parse(savedDocs);
    } catch (err) {
      // Safe fallback
    }

    function saveState() {
      try {
        localStorage.setItem("i2t_priority_v8", JSON.stringify(appState.priorityList));
        localStorage.setItem("i2t_favorites_v9", JSON.stringify(appState.shortlist));
        localStorage.setItem("i2t_docs_v8", JSON.stringify(appState.checkedDocs));
      } catch (err) {
        // Safe fallback
      }
    }

    function showToast(msg, icon = "✅") {
      const toast = document.getElementById("toast");
      const iconEl = document.getElementById("toast-icon");
      const msgEl = document.getElementById("toast-message");
      if (!toast || !iconEl || !msgEl) return;
      iconEl.textContent = icon;
      msgEl.textContent = msg;
      toast.classList.remove("hidden");
      toast.classList.add("flex");
      if (window._toastTimer) clearTimeout(window._toastTimer);
      window._toastTimer = setTimeout(() => {
        toast.classList.add("hidden");
        toast.classList.remove("flex");
      }, 3000);
    }

    // =========================================================================
    // 4. CUTOFF SCALING & ELIGIBILITY ENGINE
    // =========================================================================
    function getScaledCutoff(baseCutoff, category, exam) {
      // In JEE counseling, if the user evaluates by General / Category Rank, the rank is already on the category scale
      const mult = (appState.jeeRankMode === "general" && (exam === "jee_main" || exam === "jee_adv"))
        ? 1.0
        : (categoryMultipliers[category] || 1.0);
      const maxCap = (exam === "ap_cet" || exam === "tg_eapcet" || exam === "ts_eamcet" || exam === "kcet" || exam === "payment") ? 350000 : (exam === "jee_main" ? 180000 : 35000);
      return Math.min(maxCap, Math.round(baseCutoff * mult));
    }

    function getTargetBranchInfo(college) {
      const targetCode = appState.branch;
      if (targetCode !== "ALL") {
        const found = college.branches.find(b => b.code === targetCode);
        if (found) {
          return {
            branch: found,
            scaledCutoff: getScaledCutoff(found.closingRank, appState.category, college.exam)
          };
        }
      }
      const sortedBranches = [...college.branches].sort((a, b) => a.closingRank - b.closingRank);
      if (appState.rank) {
        const qualifying = sortedBranches.find(b => getScaledCutoff(b.closingRank, appState.category, college.exam) >= appState.rank);
        if (qualifying) {
          return {
            branch: qualifying,
            scaledCutoff: getScaledCutoff(qualifying.closingRank, appState.category, college.exam)
          };
        }
        const lastBranch = sortedBranches[sortedBranches.length - 1];
        return {
          branch: lastBranch,
          scaledCutoff: getScaledCutoff(lastBranch.closingRank, appState.category, college.exam)
        };
      }
      const firstBranch = sortedBranches[0];
      return {
        branch: firstBranch,
        scaledCutoff: getScaledCutoff(firstBranch.closingRank, appState.category, college.exam)
      };
    }

    
    const stateDistrictsMap = {
      "Andhra Pradesh": [
        "Alluri Sitharama Raju",
        "Anakapalli",
        "Ananthapuramu",
        "Annamayya",
        "Bapatla",
        "Chittoor",
        "Dr. B.R. Ambedkar Konaseema",
        "East Godavari",
        "Eluru",
        "Guntur",
        "Kakinada",
        "Krishna",
        "Kurnool",
        "Nandyal",
        "NTR",
        "Palnadu",
        "Parvathipuram Manyam",
        "Prakasam",
        "Srikakulam",
        "Sri Potti Sriramulu Nellore",
        "Sri Sathya Sai",
        "Tirupati",
        "Visakhapatnam",
        "Vizianagaram",
        "West Godavari",
        "YSR Kadapa"
      ],
      "Telangana": [
        "Hyderabad",
        "Medchal-Malkajgiri",
        "Rangareddy",
        "Sangareddy",
        "Warangal",
        "Hanumakonda",
        "Karimnagar",
        "Nizamabad",
        "Khammam",
        "Nalgonda",
        "Mahabubnagar",
        "Siddipet",
        "Medak",
        "Suryapet",
        "Jagtial",
        "Kamareddy",
        "Mancherial",
        "Nirmal",
        "Bhadradri Kothagudem",
        "Yadadri Bhuvanagiri"
      ],
      "Karnataka": [
        "Bengaluru Urban",
        "Bengaluru Rural",
        "Mysuru",
        "Dakshina Kannada (Mangaluru)",
        "Udupi",
        "Belagavi",
        "Dharwad (Hubballi)",
        "Shivamogga",
        "Tumakuru",
        "Davanagere",
        "Ballari",
        "Hassan",
        "Kalaburagi"
      ],
      "Tamil Nadu": [
        "Chennai",
        "Coimbatore",
        "Chengalpattu",
        "Kanchipuram",
        "Tiruvallur",
        "Vellore",
        "Madurai",
        "Tiruchirappalli",
        "Salem",
        "Erode",
        "Thanjavur",
        "Tirunelveli"
      ],
      "Maharashtra": [
        "Mumbai City",
        "Mumbai Suburban",
        "Pune",
        "Nagpur",
        "Nashik",
        "Thane",
        "Chhatrapati Sambhajinagar",
        "Kolhapur",
        "Solapur"
      ],
      "Delhi": [
        "New Delhi",
        "Central Delhi",
        "South Delhi",
        "North Delhi",
        "West Delhi",
        "East Delhi"
      ],
      "West Bengal": [
        "Kolkata",
        "North 24 Parganas",
        "South 24 Parganas",
        "Howrah",
        "Hooghly",
        "Paschim Bardhaman",
        "Paschim Medinipur"
      ],
      "Rajasthan": [
        "Jaipur",
        "Jodhpur",
        "Kota",
        "Udaipur",
        "Ajmer",
        "Bikaner",
        "Alwar"
      ],
      "Kerala": [
        "Thiruvananthapuram",
        "Ernakulam (Kochi)",
        "Kozhikode",
        "Thrissur",
        "Kollam",
        "Palakkad"
      ],
      "Uttar Pradesh": [
        "Gautam Buddha Nagar (Noida)",
        "Lucknow",
        "Kanpur Nagar",
        "Ghaziabad",
        "Varanasi",
        "Prayagraj",
        "Agra"
      ],
      "Gujarat": [
        "Ahmedabad",
        "Gandhinagar",
        "Vadodara",
        "Surat",
        "Rajkot"
      ]
    };

    function updateDistrictDropdown(chosenState) {
      const distSelect = document.getElementById("district-select");
      if (!distSelect) return;

      const distLabel = document.getElementById("district-label-title");
      if (distLabel) {
        if (chosenState === "Andhra Pradesh") {
          distLabel.textContent = "AP District (All 26 Districts)";
        } else if (chosenState === "ALL") {
          distLabel.textContent = "District (All Districts)";
        } else {
          distLabel.textContent = `${chosenState} District`;
        }
      }

      const list = stateDistrictsMap[chosenState] || stateDistrictsMap["Andhra Pradesh"];
      const defaultLabel = chosenState === "ALL" 
        ? "All 26 AP & National Districts" 
        : (chosenState === "Andhra Pradesh" ? "All 26 AP Districts" : `All ${chosenState} Districts`);

      let html = `<option value="ALL" selected>${defaultLabel}</option>`;
      list.forEach(d => {
        html += `<option value="${d}">${d}</option>`;
      });
      distSelect.innerHTML = html;
      appState.district = "ALL";
    }

    function getFilteredColleges() {
      const q = (appState.search || "").trim().toLowerCase();
      const hasSearch = q.length > 0;
      const activeExam = appState.exam || "ap_cet";

      let list = collegesData.filter(college => {
        // 1. STRICT FILTER BY ENTRANCE EXAM: Must strictly match the selected exam!
        if (activeExam === "tg_eapcet" || activeExam === "ts_eamcet") {
          if (college.exam !== "tg_eapcet" && college.exam !== "ts_eamcet") return false;
        } else if (activeExam === "ap_cet") {
          if (college.exam !== "ap_cet") return false;
        } else if (activeExam === "kcet") {
          if (college.exam !== "kcet") return false;
        } else if (activeExam === "jee_main") {
          if (college.exam !== "jee_main") return false;
        } else if (activeExam === "jee_adv") {
          if (college.exam !== "jee_adv") return false;
        } else if (activeExam === "payment") {
          if (college.exam !== "payment") return false;
        } else if (activeExam && activeExam !== "ALL") {
          if (college.exam !== activeExam) return false;
        }

        // Search strictly WITHIN the selected exam's colleges:
        if (hasSearch) {
          const matchName = (college.name || "").toLowerCase().includes(q);
          const matchCode = (college.code || "").toLowerCase().includes(q);
          const matchLoc = (college.location || "").toLowerCase().includes(q);
          const matchDist = (college.district || "").toLowerCase().includes(q);
          const matchUniv = (college.university || "").toLowerCase().includes(q);
          const matchBr = Array.isArray(college.branches) && college.branches.some(b => 
            (b.code || "").toLowerCase().includes(q) || (b.name || "").toLowerCase().includes(q)
          );
          if (!matchName && !matchCode && !matchLoc && !matchDist && !matchUniv && !matchBr) {
            return false;
          }
        }

        // 2. Filter by State (ONLY for JEE Main & JEE Advanced multi-state selector, or Pan-India exams)
        if (activeExam === "jee_main" || activeExam === "jee_adv" || activeExam === "ALL") {
          if (Array.isArray(appState.selectedStates) && appState.selectedStates.length > 0 && !appState.selectedStates.includes("ALL")) {
            const cState = (college.state || (college.location && college.location.includes("AP") ? "Andhra Pradesh" : "")).trim().toLowerCase();
            const matched = appState.selectedStates.some(st => st.trim().toLowerCase() === cState);
            if (!matched) return false;
          } else if (appState.state && appState.state !== "ALL") {
            const s = appState.state.trim().toLowerCase();
            const cState = (college.state || (college.location && college.location.includes("AP") ? "Andhra Pradesh" : "")).trim().toLowerCase();
            if (cState !== s) return false;
          }
        }

        // 3. AP Region (AU / SVU) - Only applies to AP CET
        if (activeExam === "ap_cet" && appState.region !== "ALL" && college.region !== appState.region) return false;

        // 4. District - Only applies to AP CET
        if (activeExam === "ap_cet" && appState.district !== "ALL") {
          const d = appState.district.trim().toLowerCase();
          const cDist = (college.district || "").trim().toLowerCase();
          const cLoc = (college.location || "").trim().toLowerCase();
          if (!cDist.includes(d) && !cLoc.includes(d) && !d.includes(cDist)) return false;
        }

        // 5. Branch filter
        if (appState.branch !== "ALL") {
          const hasBranch = Array.isArray(college.branches) && college.branches.some(b => b.code === appState.branch);
          if (!hasBranch) return false;
        }

        // 6. College Type filter (Govt / Pvt / etc.)
        if (appState.type !== "ALL" && college.type !== appState.type) return false;

        // 7. Minimum Package filter
        if (appState.minPkg > 0 && college.placements && college.placements.numAvgPkg < appState.minPkg) return false;

        // 8. Low placement filter
        if (appState.hideLowPlacement && college.lowPlacementFlag) return false;

        // 9. Cutoff / Rank eligibility
        if (appState.onlyEligible && appState.rank) {
          if (college.exam === "payment") return true;
          const relevantBranches = appState.branch === "ALL"
            ? college.branches
            : college.branches.filter(b => b.code === appState.branch);
          const hasEligible = Array.isArray(relevantBranches) && relevantBranches.some(b => {
            const cutoff = getScaledCutoff(b.closingRank, appState.category, college.exam);
            return appState.rank <= Math.round(cutoff * 1.15);
          });
          if (!hasEligible) return false;
        }

        return true;
      });

    function getCollegeCutoffForSort(college) {
        if (!college.branches || college.branches.length === 0) return 999999;
        const relevantBranches = appState.branch === "ALL"
          ? college.branches
          : college.branches.filter(b => b.code === appState.branch);
        const brs = relevantBranches.length > 0 ? relevantBranches : college.branches;

        if (appState.rank) {
          const qualifying = brs.filter(b => {
            const cutoff = getScaledCutoff(b.closingRank, appState.category, college.exam);
            return appState.rank <= Math.round(cutoff * 1.15);
          });
          if (qualifying.length > 0) {
            const cutoffs = qualifying.map(b => getScaledCutoff(b.closingRank, appState.category, college.exam));
            return Math.min(...cutoffs);
          }
        }
        const cutoffs = brs.map(b => getScaledCutoff(b.closingRank, appState.category, college.exam));
        return Math.min(...cutoffs);
      }

      // Sort colleges according to rank / user preference
      if (appState.exam === "payment") {
        list.sort((a, b) => {
          const pA = a.paymentPriority || 99;
          const pB = b.paymentPriority || 99;
          if (pA !== pB) return pA - pB;
          return (b.placements?.numAvgPkg || 0) - (a.placements?.numAvgPkg || 0);
        });
      } else if (appState.sortBy === "rank_asc" || !appState.sortBy) {
        // Sort according to rank / closing cutoffs
        list.sort((a, b) => {
          const cutA = getCollegeCutoffForSort(a);
          const cutB = getCollegeCutoffForSort(b);
          if (cutA !== cutB) return cutA - cutB;
          return (b.placements?.numAvgPkg || 0) - (a.placements?.numAvgPkg || 0);
        });
      } else if (appState.sortBy === "random") {
        list.sort(() => Math.random() - 0.5);
      } else if (appState.sortBy === "rating_high") {
        list.sort((a, b) => parseFloat(b.rating || 0) - parseFloat(a.rating || 0));
      } else if (appState.sortBy === "placement_avg") {
        list.sort((a, b) => (b.placements?.numAvgPkg || 0) - (a.placements?.numAvgPkg || 0));
      } else if (appState.sortBy === "placement_high") {
        list.sort((a, b) => (b.placements?.numHighestPkg || 0) - (a.placements?.numHighestPkg || 0));
      } else if (appState.sortBy === "tuition_low") {
        list.sort((a, b) => {
          const parseFee = c => parseInt((c.fees?.annualTuition || "").replace(/[^0-9]/g, "") || "999999", 10);
          return parseFee(a) - parseFee(b);
        });
      } else if (appState.sortBy === "name_asc") {
        list.sort((a, b) => a.name.localeCompare(b.name));
      }

      return list;
    }

    function renderExplorer() {
      const filtered = getFilteredColleges();
      const grid = document.getElementById("colleges-grid");
      const countBadge = document.getElementById("results-count-badge");
      const noResults = document.getElementById("no-results-state");
      const loadMoreContainer = document.getElementById("load-more-container");
      const paginationStatus = document.getElementById("pagination-status-text");
      const subtext = document.getElementById("results-subtext");

      if (countBadge) {
        countBadge.textContent = `${filtered.length} Colleges`;
      }

      if (subtext) {
        subtext.innerHTML = "";
        subtext.classList.add("hidden");
      }

      if (filtered.length === 0) {
        grid.innerHTML = "";
        noResults.classList.remove("hidden");
        loadMoreContainer.classList.add("hidden");
        return;
      }

      noResults.classList.add("hidden");
      const visibleColleges = filtered.slice(0, appState.currentLimit);

      if (filtered.length > appState.currentLimit) {
        loadMoreContainer.classList.remove("hidden");
        paginationStatus.textContent = `Showing ${visibleColleges.length} of ${filtered.length} matching colleges`;
      } else {
        loadMoreContainer.classList.add("hidden");
      }

      const cardsHtml = visibleColleges.map(college => {
        const isShortlisted = appState.shortlist.includes(college.id);
        const qualifyingBranches = [];
        const borderlineBranches = [];
        const closedBranches = [];

        college.branches.forEach(br => {
          const cutoff = getScaledCutoff(br.closingRank, appState.category, college.exam);
          if (!appState.rank || college.exam === "payment") {
            qualifyingBranches.push({ ...br, cutoff });
          } else if (appState.rank <= cutoff) {
            qualifyingBranches.push({ ...br, cutoff });
          } else if (appState.rank <= Math.round(cutoff * 1.15)) {
            borderlineBranches.push({ ...br, cutoff });
          } else {
            closedBranches.push({ ...br, cutoff });
          }
        });

        const ratingVal = parseFloat(college.rating);
        const ratingBadgeClass = ratingVal >= 4.4
          ? "bg-emerald-100 text-emerald-900 border-emerald-300"
          : (ratingVal >= 3.8 ? "bg-blue-100 text-blue-900 border-blue-300" : "bg-amber-100 text-amber-900 border-amber-300");

        const lowPlacementHtml = college.lowPlacementFlag
          ? `<div class="mt-2 px-2.5 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-[11px] text-rose-800 font-semibold flex items-center gap-1.5">
               <span>⚠️</span>
               <span>Poor / Low Placement Activity (${college.placements.numRate}% in 2025)</span>
             </div>`
          : "";

        let paymentHighlightHtml = "";
        if (college.exam === "payment") {
          const priBadge = college.paymentPriority
            ? `<span class="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs">★ Priority #${college.paymentPriority} Seat</span>`
            : "";
          const stateBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">📍 ${college.state || "India"}</span>`;
          paymentHighlightHtml = `
            <div class="mt-2.5 p-2.5 rounded-xl bg-amber-50/90 border border-amber-200 text-[11px] space-y-1">
              <div class="flex items-center justify-between gap-1 flex-wrap">
                ${priBadge}
                ${stateBadge}
              </div>
              <div class="font-bold text-amber-900 flex items-center justify-between pt-1">
                <span>${college.paymentInfo?.examName || "Direct / Management Quota"}</span>
                <span class="bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded text-[10px]">Merit Waivers</span>
              </div>
              <div class="text-[10px] text-amber-800">
                Tuition: <strong>${college.fees?.annualTuition || "₹3.5–5.4 L/yr"}</strong> • Criteria: ${college.paymentInfo?.criteria || "10+2 MPC Merit / Management"}
              </div>
            </div>
          `;
        } else if (college.exam === "payment" && college.paymentInfo) {
          paymentHighlightHtml = `
            <div class="mt-2.5 p-2.5 rounded-xl bg-amber-50/90 border border-amber-200 text-[11px] space-y-1">
              <div class="font-bold text-amber-900 flex items-center justify-between">
                <span>${college.paymentInfo.examName}</span>
                <span class="bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded text-[10px]">Up to 100% Waiver</span>
              </div>
              <p class="text-amber-950 text-[10px] leading-snug">${college.paymentInfo.discounts[0]}</p>
              <p class="text-slate-600 text-[10px]">🗓️ ${college.paymentInfo.deadline}</p>
            </div>
          `;
        }

        let branchBadgesHtml = "";
        if (qualifyingBranches.length > 0 || borderlineBranches.length > 0) {
          const greenPills = qualifyingBranches.map(b => {
            const inPriority = appState.priorityList.some(p => p.collegeId === college.id && p.branchCode === b.code);
            return `<button type="button" data-action="quick-add-branch" data-college-id="${college.id}" data-branch-code="${b.code}" onclick="event.stopPropagation();"
              class="px-2 py-1 rounded-lg text-[11px] font-bold border transition flex items-center gap-1 cursor-pointer ${
                inPriority
                  ? "bg-slate-900 hover:bg-rose-950 text-amber-300 hover:text-rose-200 border-slate-900 hover:border-rose-700"
                  : "bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white border-emerald-300"
              }" title="${inPriority ? "Click to remove " + college.code + " (" + b.code + ") from Priority Sheet" : "Click to add " + college.code + " (" + b.code + ") to Priority Sheet"}">
              <span>${inPriority ? "✓" : "+"} ${b.code}</span>
              <span class="text-[10px] opacity-80">(~${b.cutoff.toLocaleString("en-IN")})</span>
            </button>`;
          }).join("");

          const amberPills = borderlineBranches.map(b => {
            const inPriority = appState.priorityList.some(p => p.collegeId === college.id && p.branchCode === b.code);
            return `<button type="button" data-action="quick-add-branch" data-college-id="${college.id}" data-branch-code="${b.code}" onclick="event.stopPropagation();"
              class="px-2 py-1 rounded-lg text-[11px] font-bold border transition flex items-center gap-1 cursor-pointer ${
                inPriority
                  ? "bg-slate-900 hover:bg-rose-950 text-amber-300 hover:text-rose-200 border-slate-900 hover:border-rose-700"
                  : "bg-amber-50 hover:bg-amber-500 text-amber-900 hover:text-slate-950 border-amber-300"
              }" title="${inPriority ? "Click to remove " + college.code + " (" + b.code + ") from Priority Sheet" : "Round 2 Slide Chance - Click to add " + college.code + " (" + b.code + ")"}">
              <span>${inPriority ? "✓" : "+"} ${b.code}</span>
              <span class="text-[10px] opacity-80">(Slide ~${b.cutoff.toLocaleString("en-IN")})</span>
            </button>`;
          }).join("");

          const closedNote = closedBranches.length > 0
            ? `<div class="text-[10px] text-slate-400 mt-1.5">
                 Closed earlier: ${closedBranches.map(c => `${c.code} (~${c.cutoff.toLocaleString("en-IN")})`).join(", ")}
               </div>`
            : "";

          branchBadgesHtml = `
            <div class="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/90">
              <div class="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                <span>${appState.rank ? "Qualifying Branches (Click to Add / Remove)" : "Available Branches & Cutoffs (" + appState.category + ")"}</span>
                <span class="text-emerald-700">${qualifyingBranches.length} Eligible</span>
              </div>
              <div class="flex flex-wrap gap-1.5">
                ${greenPills}
                ${amberPills}
              </div>
              ${closedNote}
            </div>
          `;
        } else {
          branchBadgesHtml = `
            <div class="mt-3 p-2.5 rounded-xl bg-rose-50/70 border border-rose-200 text-[11px]">
              <div class="font-bold text-rose-800 mb-1">Rank ${appState.rank.toLocaleString("en-IN")} is above Round 1 cutoffs</div>
              <div class="text-[10px] text-rose-700">
                Cutoffs (${appState.category}): ${closedBranches.slice(0, 4).map(c => `${c.code} (~${c.cutoff.toLocaleString("en-IN")})`).join(", ")}
              </div>
            </div>
          `;
        }

        return `
          <div class="college-card bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer group" onclick="if (typeof openCollegeDetailPage === 'function') openCollegeDetailPage('${college.id}')">
            <!-- Top Image Banner -->
            <div class="relative h-56 sm:h-64 w-full overflow-hidden bg-slate-900 shrink-0 select-none cursor-pointer" onclick="if (typeof openCollegeDetailPage === 'function') openCollegeDetailPage('${college.id}')">
              <img src="${(typeof getCollegeImageUrl === 'function') ? getCollegeImageUrl(college) : ''}" alt="${college.name}" data-orig-src="${(typeof getCollegeImageUrl === 'function') ? getCollegeImageUrl(college) : ''}" data-fallback-step="0" class="w-full h-full object-cover transition-all duration-300 group-hover:scale-105" loading="lazy" onerror="window.handleCollegeImgError(this, '${college.code || college.id}');">
              <!-- Top Left Badges -->
              <div class="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap z-10">
                <span class="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase backdrop-blur-md bg-black/70 text-white border border-white/20 shadow-sm">${college.code}</span>
                <span class="px-2 py-0.5 rounded-md text-[10px] font-black backdrop-blur-md bg-black/60 text-amber-300 border border-amber-400/40 shadow-sm flex items-center gap-1">★ ${college.rating} <span class="text-white/80 font-semibold text-[9px]">(${college.grade})</span></span>
              </div>
              <!-- Bottom Location & Package Overlay with Reliable Location -->
              <div class="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex items-center justify-between text-white z-10 pointer-events-none">
                <span class="text-[11px] font-bold text-slate-100 flex items-center gap-1 truncate max-w-[65%]">
                  <span>📍</span>
                  <span>${getCollegeCardLocation(college)}</span>
                </span>
                <span class="text-[11px] font-black text-amber-300 bg-amber-400/20 px-1.5 py-0.5 rounded border border-amber-400/40 shadow-xs">${college.placements?.medianPackage || college.placements?.medianSalary || (college.placements?.numMedianPkg ? '₹' + college.placements.numMedianPkg + ' LPA' : '₹4.5 LPA')}</span>
              </div>
            </div>
            <div class="p-4 sm:p-5 flex-1 flex flex-col justify-between">
              <div class="flex items-center justify-between gap-2 mb-2">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-900 text-white tracking-wider">${college.code}</span>
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">${getCollegeCardLocation(college)}</span>
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded border ${ratingBadgeClass}">${college.rating} (${college.grade})</span>
                </div>
                <button type="button" data-action="toggle-shortlist" data-college-id="${college.id}" onclick="event.stopPropagation();"
                  class="text-xs px-2 py-1 rounded-lg border transition font-semibold ${
                    isShortlisted
                      ? "bg-amber-100 border-amber-300 text-amber-900"
                      : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                  }">
                  ${isShortlisted ? "★ Favorite" : "☆ Favorite"}
                </button>
              </div>

              <h4 class="text-sm sm:text-base font-extrabold text-slate-900 leading-snug hover:text-blue-700 cursor-pointer" onclick="if (typeof openCollegeDetailPage === 'function') openCollegeDetailPage('${college.id}')">
                ${college.name}
              </h4>
              <p class="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                <span>📍 ${getCollegeCardLocation(college)}</span>
                <span>•</span>
                <span>Est. ${college.established || '2008'}</span>
              </p>

              <div class="grid grid-cols-3 gap-2 mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <div>
                  <span class="block text-[10px] text-slate-400 font-semibold uppercase">2025 Placed</span>
                  <span class="text-xs font-extrabold ${college.lowPlacementFlag ? "text-rose-700" : "text-emerald-700"}">${college.placements.numRate}% Actual</span>
                </div>
                <div>
                  <span class="block text-[10px] text-slate-400 font-semibold uppercase">Median Salary</span>
                  <span class="text-xs font-extrabold text-blue-800">${college.placements.medianPackage}</span>
                </div>
                <div>
                  <span class="block text-[10px] text-slate-400 font-semibold uppercase">Tuition / Yr</span>
                  <span class="text-xs font-extrabold text-slate-800">₹${(college.fees.numTuition / 1000).toFixed(0)}K</span>
                </div>
              </div>

              ${lowPlacementHtml}
              ${paymentHighlightHtml}
              ${branchBadgesHtml}
            </div>

            <div class="px-4 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
              <button type="button" onclick="if (typeof openCollegeDetailPage === 'function') openCollegeDetailPage('${college.id}')"
                class="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer">
                <span>Campus, Hostels & Food</span>
                <span>→</span>
              </button>
              <div class="flex items-center gap-1.5">
                <button type="button" data-action="open-roi-for-college" data-college-id="${college.id}" onclick="event.stopPropagation();"
                  class="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold text-[11px] transition cursor-pointer" title="Calculate 4-Year ROI">
                  ROI
                </button>
                <button type="button" data-action="add-default-priority" data-college-id="${college.id}" onclick="event.stopPropagation();"
                  class="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition cursor-pointer">
                  + Add Priority
                </button>
              </div>
            </div>
          </div>
        `;
      }).join("");

      grid.innerHTML = cardsHtml;
    }

    // =========================================================================
    // 6. PRIORITY WEB OPTIONS SHEET & MOCK SEAT ALLOTMENT SIMULATOR
    // =========================================================================
    function updateHeaderBadges() {
      const count = appState.priorityList.length;
      document.getElementById("priority-count-badge").textContent = count;
      const navDocsBadge = document.getElementById("nav-docs-count-badge");
      if (navDocsBadge && typeof checklistDocsData !== "undefined") {
        const completedDocs = checklistDocsData.filter(d => appState.checkedDocs && appState.checkedDocs[d.id]).length;
        navDocsBadge.textContent = `${completedDocs}/${checklistDocsData.length}`;
      }
      document.getElementById("priority-tab-count").textContent = count;
      document.getElementById("priority-total-badge").textContent = `${count} ${count === 1 ? "Choice" : "Choices"}`;
      document.getElementById("shortlist-count-badge").textContent = appState.shortlist.length;
      document.getElementById("priority-category-tag").textContent = `Quota: ${appState.category}`;
      document.getElementById("priority-rank-tag").textContent = appState.rank
        ? `Rank: ${appState.rank.toLocaleString("en-IN")}`
        : `Rank: Enter Rank for Live Cutoff Match`;
    }

    function addPriorityOption(collegeId, branchCode) {
      const college = collegesData.find(c => c.id === collegeId);
      if (!college) return;
      if (!genderOk(college)) { showToast(college.code + " admits women only", "⚠️"); return; }

      let chosenBranch = branchCode;
      if (!chosenBranch) {
        const info = getTargetBranchInfo(college);
        chosenBranch = info.branch.code;
      }

      const existingIndex = appState.priorityList.findIndex(item => item.collegeId === collegeId && item.branchCode === chosenBranch);
      if (existingIndex !== -1) {
        // Toggle: remove if already present in priority sheet
        appState.priorityList.splice(existingIndex, 1);
        saveState();
        updateHeaderBadges();
        renderExplorer();
        renderPrioritySheet();
        if (appState.activeModalCollegeId === collegeId) {
          openCollegeModal(collegeId);
        }
        if (typeof renderCutoffMatrix === "function" && document.getElementById("cutoff-matrix-tbody")) {
          renderCutoffMatrix();
        }
        showToast(`Removed Option: ${college.code} (${chosenBranch})`, "🗑️");
        return;
      }

      // Add to priority sheet
      appState.priorityList.push({ collegeId, branchCode: chosenBranch });
      saveState();
      updateHeaderBadges();
      renderExplorer();
      renderPrioritySheet();
      if (appState.activeModalCollegeId === collegeId) {
        openCollegeModal(collegeId);
      }
      if (typeof renderCutoffMatrix === "function" && document.getElementById("cutoff-matrix-tbody")) {
        renderCutoffMatrix();
      }
      showToast(`Added Option #${appState.priorityList.length}: ${college.code} (${chosenBranch})`, "📋");
    }

    function renderPrioritySheet() {
      updateHeaderBadges();
      const emptyState = document.getElementById("priority-empty-state");
      const listContainer = document.getElementById("priority-list-container");
      const simContainer = document.getElementById("allotment-result-container");

      if (appState.priorityList.length === 0) {
        emptyState.classList.remove("hidden");
        listContainer.classList.add("hidden");
        simContainer.classList.add("hidden");
        listContainer.innerHTML = "";
        return;
      }

      emptyState.classList.add("hidden");
      listContainer.classList.remove("hidden");

      const userRank = appState.rank || 15000;
      const rowsHtml = appState.priorityList.map((item, idx) => {
        const college = collegesData.find(c => c.id === item.collegeId);
        if (!college) return "";
        const branchObj = college.branches.find(b => b.code === item.branchCode) || college.branches[0];
        const cutoff = getScaledCutoff(branchObj.closingRank, appState.category, college.exam);

        let statusBadge = "";
        if (college.exam === "payment") {
          statusBadge = `<span class="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[10px]">Direct / Merit Seat</span>`;
        } else if (userRank <= cutoff) {
          statusBadge = `<span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">✅ Safe (Cutoff ~${cutoff.toLocaleString("en-IN")})</span>`;
        } else if (userRank <= Math.round(cutoff * 1.15)) {
          statusBadge = `<span class="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[10px]">⚡ Round 2 Slide (~${cutoff.toLocaleString("en-IN")})</span>`;
        } else {
          statusBadge = `<span class="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold text-[10px]">🎯 Ambitious (Cutoff ~${cutoff.toLocaleString("en-IN")})</span>`;
        }

        const branchOptionsHtml = college.branches.map(b =>
          `<option value="${b.code}" ${b.code === branchObj.code ? "selected" : ""}>${b.code} - ${b.name}</option>`
        ).join("");

        return `
          <div class="py-3.5 px-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 rounded-xl transition border-b border-slate-100 last:border-b-0">
            <div class="flex items-start sm:items-center gap-3 min-w-0 flex-1">
              <div class="w-9 h-9 rounded-xl bg-blue-900 text-amber-300 font-extrabold text-xs flex items-center justify-center shrink-0 shadow-sm">
                #${idx + 1}
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-extrabold text-slate-900 text-sm hover:text-blue-700 cursor-pointer" onclick="if (typeof openCollegeDetailPage === 'function') openCollegeDetailPage('${college.id}')">${college.name}</span>
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">${college.code}</span>
                  <span class="text-[10px] font-semibold text-slate-500">${getCollegeCardLocation(college)}</span>
                </div>
                <div class="flex items-center gap-2 flex-wrap mt-1.5 text-xs">
                  <select data-action="change-priority-branch" data-index="${idx}" class="bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-indigo-900 max-w-full">
                    ${branchOptionsHtml}
                  </select>
                  ${statusBadge}
                  <span class="text-[11px] text-slate-500">Median: <strong>${college.placements.medianPackage}</strong> • Fee: <strong>${college.fees.annualTuition}</strong></span>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-1.5 self-end sm:self-center shrink-0 no-print">
              <button type="button" data-action="move-priority-up" data-index="${idx}" ${idx === 0 ? "disabled" : ""}
                class="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 flex items-center justify-center text-xs disabled:opacity-30 cursor-pointer shadow-xs" title="Move Up">▲</button>
              <button type="button" data-action="move-priority-down" data-index="${idx}" ${idx === appState.priorityList.length - 1 ? "disabled" : ""}
                class="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 flex items-center justify-center text-xs disabled:opacity-30 cursor-pointer shadow-xs" title="Move Down">▼</button>
              <button type="button" data-action="remove-priority" data-index="${idx}"
                class="w-8 h-8 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 flex items-center justify-center text-xs font-bold cursor-pointer shadow-xs" title="Remove">✕</button>
            </div>
          </div>
        `;
      }).join("");

      listContainer.innerHTML = rowsHtml;
    }

    function runMockAllotmentSimulation() {
      const container = document.getElementById("allotment-result-container");
      if (appState.priorityList.length === 0) {
        showToast("Add at least 1 college to your Priority Sheet first!", "⚠️");
        return;
      }

      if (appState.exam !== "payment" && !appState.rank) {
        const simRank = 12500;
        appState.rank = simRank;
        document.getElementById("rank-input").value = simRank;
        document.getElementById("rank-clear-btn").classList.remove("hidden");
      }
      const simRank = appState.rank || 0;

      let round1Allotted = null;
      let round2SlideCandidate = null;

      for (let i = 0; i < appState.priorityList.length; i++) {
        const item = appState.priorityList[i];
        const college = collegesData.find(c => c.id === item.collegeId);
        if (!college) continue;
        const branchObj = college.branches.find(b => b.code === item.branchCode) || college.branches[0];
        const cutoff = getScaledCutoff(branchObj.closingRank, appState.category, college.exam);

        if (college.exam === "payment" || simRank <= cutoff) {
          if (!round1Allotted) {
            round1Allotted = { optionNum: i + 1, college, branch: branchObj, cutoff };
          }
        } else if (!round1Allotted && !round2SlideCandidate && simRank <= Math.round(cutoff * 1.18)) {
          round2SlideCandidate = {
            optionNum: i + 1,
            college,
            branch: branchObj,
            cutoff,
            gap: simRank - cutoff
          };
        }
      }

      container.classList.remove("hidden");

      if (round1Allotted) {
        let slideForecastHtml = `<p class="text-xs text-emerald-900 mt-2">🎉 You matched your top attainable choice in Round 1! Freeze this seat or opt for Round 2 sliding.</p>`;
        if (round1Allotted.optionNum > 1) {
          const topItem = appState.priorityList[0];
          const topCol = collegesData.find(c => c.id === topItem.collegeId);
          const topBr = topCol.branches.find(b => b.code === topItem.branchCode) || topCol.branches[0];
          const topCut = getScaledCutoff(topBr.closingRank, appState.category, topCol.exam);
          const diff = Math.max(0, simRank - topCut);
          slideForecastHtml = `
            <div class="mt-2.5 p-2.5 rounded-xl bg-white/80 border border-emerald-200 text-xs text-slate-700">
              <strong>Round 2 Sliding Forecast:</strong> You are <strong>${diff.toLocaleString("en-IN")} ranks</strong> away from Option #1 (<strong>${topCol.code} - ${topBr.code}</strong>, Cutoff ~${topCut.toLocaleString("en-IN")}). Keep Option #1 above your allotted seat for Phase-2 upgradation!
            </div>
          `;
        }

        container.innerHTML = `
          <div class="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950">
            <div class="flex items-center justify-between flex-wrap gap-2">
              <span class="text-xs font-extrabold uppercase tracking-wider bg-emerald-600 text-white px-2.5 py-0.5 rounded-full">
                ✅ Round 1 Seat Allotted (Option #${round1Allotted.optionNum})
              </span>
              <span class="text-xs font-bold text-emerald-800">Rank ${simRank.toLocaleString("en-IN")} (${appState.category}) &lt;= Closing Cutoff ${round1Allotted.cutoff.toLocaleString("en-IN")}</span>
            </div>
            <h4 class="text-base sm:text-lg font-extrabold text-slate-900 mt-2">
              ${round1Allotted.college.name} — <span class="text-blue-700">${round1Allotted.branch.name} (${round1Allotted.branch.code})</span>
            </h4>
            <p class="text-xs text-slate-600 mt-0.5">
              Annual Tuition: <strong>${round1Allotted.college.fees.annualTuition}</strong> (${round1Allotted.college.fees.jvdStatus}) • 2025 Median Package: <strong>${round1Allotted.college.placements.medianPackage}</strong>
            </p>
            ${slideForecastHtml}
          </div>
        `;
      } else {
        const safeColleges = collegesData
          .filter(c => c.exam === appState.exam && c.branches.some(b => getScaledCutoff(b.closingRank, appState.category, c.exam) >= simRank * 1.05))
          .slice(0, 3);

        const safeButtonsHtml = safeColleges.map(sc => {
          const sb = sc.branches.find(b => getScaledCutoff(b.closingRank, appState.category, sc.exam) >= simRank) || sc.branches[sc.branches.length - 1];
          return `<button type="button" data-action="quick-add-branch" data-college-id="${sc.id}" data-branch-code="${sb.code}"
            class="px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold text-xs shadow-sm">
            + Add Safe Backup: ${sc.code} (${sb.code})
          </button>`;
        }).join("");

        container.innerHTML = `
          <div class="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-950 space-y-2">
            <div class="flex items-center justify-between flex-wrap gap-2">
              <span class="text-xs font-extrabold uppercase bg-rose-600 text-white px-2.5 py-0.5 rounded-full">
                ⚠️ Safety Check Alert: No Seat Allotted in Round 1
              </span>
              <span class="text-xs font-bold text-rose-800">Entered Rank: ${simRank.toLocaleString("en-IN")} (${appState.category})</span>
            </div>
            <p class="text-xs leading-relaxed">
              Your current priority choices all closed earlier than Rank <strong>${simRank.toLocaleString("en-IN")}</strong>. ${
                round2SlideCandidate
                  ? `However, you are only <strong>${round2SlideCandidate.gap.toLocaleString("en-IN")} ranks</strong> away from <strong>${round2SlideCandidate.college.code} (${round2SlideCandidate.branch.code})</strong> in Round 2!`
                  : `To avoid going unallotted, add safe backup options below before locking your web options:`
              }
            </p>
            <div class="flex flex-wrap gap-2 pt-1 no-print">
              ${safeButtonsHtml}
            </div>
          </div>
        `;
      }
      showToast("Mock Seat Allotment Simulation completed!", "🎯");
    }

    function smartAutoFillPriority() {
      // 1. Direct handling for Payment & Deemed Universities (Sorted by Priority)
      if (appState.exam === "payment") {
        let paymentColleges = collegesData.filter(c => c.exam === "payment");
        if (Array.isArray(appState.selectedStates) && appState.selectedStates.length > 0 && !appState.selectedStates.includes("ALL")) {
          paymentColleges = paymentColleges.filter(c => appState.selectedStates.some(st => (c.state || "").toLowerCase().includes(st.toLowerCase())));
        } else if (appState.state && appState.state !== "ALL") {
          const s = appState.state.toLowerCase();
          paymentColleges = paymentColleges.filter(c => (c.state || "").toLowerCase().includes(s));
        }
        paymentColleges.sort((a, b) => (a.paymentPriority || 99) - (b.paymentPriority || 99));

        const candidates = [];
        paymentColleges.forEach(c => {
          c.branches.forEach(b => {
            candidates.push({ collegeId: c.id, branchCode: b.code });
          });
        });
        appState.priorityList = candidates.slice(0, 8);
        saveState();
        renderPrioritySheet();
        renderExplorer();
        runMockAllotmentSimulation();
        const stateMsg = (appState.state && appState.state !== "ALL") ? `in ${appState.state}` : "across All States";
        showToast(`Auto-filled top ${appState.priorityList.length} Payment / Management Quota options ${stateMsg} by priority!`, "📋");
        return;
      }

      const targetRank = appState.rank || 100000;
      if (!appState.rank) {
        appState.rank = targetRank;
        const ri = document.getElementById("rank-input");
        if (ri) ri.value = targetRank;
        document.getElementById("rank-clear-btn")?.classList.remove("hidden");
      }

      if (false && appState.exam === "payment") {
        let paymentColleges = collegesData.filter(c => c.exam === "payment");
        if (Array.isArray(appState.selectedStates) && appState.selectedStates.length > 0 && !appState.selectedStates.includes("ALL")) {
          paymentColleges = paymentColleges.filter(c => appState.selectedStates.some(st => (c.state || "").toLowerCase().includes(st.toLowerCase())));
        } else if (appState.state && appState.state !== "ALL") {
          const s = appState.state.toLowerCase();
          paymentColleges = paymentColleges.filter(c => (c.state || "").toLowerCase().includes(s));
        }
        // Sort strictly according to paymentPriority
        paymentColleges.sort((a, b) => (a.paymentPriority || 99) - (b.paymentPriority || 99));

        const candidates = [];
        paymentColleges.forEach(c => {
          c.branches.forEach(b => {
            candidates.push({ collegeId: c.id, branchCode: b.code });
          });
        });
        appState.priorityList = candidates.slice(0, 8);
        saveState();
        renderPrioritySheet();
        renderExplorer();
        runMockAllotmentSimulation();
        const stateMsg = (appState.state && appState.state !== "ALL") ? `in ${appState.state}` : "across All States";
        showToast(`Auto-filled top ${appState.priorityList.length} Payment / Management Quota options ${stateMsg} by priority!`, "📋");
        return;
      }

      // 2. Exam-specific college pool
      let pool = collegesData.filter(c => {
        if (appState.exam === "jee_main") return c.exam === "jee_main";
        if (appState.exam === "jee_adv") return c.exam === "jee_adv";
        if (appState.exam === "bitsat") return c.exam === "bitsat";
        return c.exam === appState.exam || c.exam === "ap_cet";
      });

      if (Array.isArray(appState.selectedStates) && appState.selectedStates.length > 0 && !appState.selectedStates.includes("ALL")) {
        const stPool = pool.filter(c => appState.selectedStates.some(st => (c.state || "").toLowerCase().includes(st.toLowerCase())));
        if (stPool.length > 0) pool = stPool;
      } else if (appState.state && appState.state !== "ALL") {
        const s = appState.state.toLowerCase();
        const stPool = pool.filter(c => (c.state || "").toLowerCase().includes(s));
        if (stPool.length > 0) pool = stPool;
      }

      pool = pool.filter(c => !c.lowPlacementFlag && genderOk(c));
      if (pool.length === 0) {
        pool = collegesData.filter(c => !c.lowPlacementFlag && genderOk(c));
      }

      const candidates = [];
      pool.forEach(c => {
        const preferredBranches = appState.branch === "ALL"
          ? c.branches
          : c.branches.filter(b => b.code === appState.branch);
        preferredBranches.forEach(b => {
          const cutoff = getScaledCutoff(b.closingRank, appState.category, c.exam);
          candidates.push({ college: c, branch: b, cutoff });
        });
      });

      candidates.sort((a, b) => a.cutoff - b.cutoff);

      const dream = candidates.filter(x => x.cutoff >= targetRank * 0.55 && x.cutoff < targetRank).slice(-2);
      const target = candidates.filter(x => x.cutoff >= targetRank && x.cutoff <= targetRank * 1.6).slice(0, 4);
      const safe = candidates.filter(x => x.cutoff > targetRank * 1.6).slice(0, 2);

      const combined = [...dream, ...target, ...safe];
      const fallback = candidates.slice(0, 8);
      const finalSelection = combined.length >= 4 ? combined : fallback;

      appState.priorityList = finalSelection.map(x => ({
        collegeId: x.college.id,
        branchCode: x.branch.code
      }));

      saveState();
      renderPrioritySheet();
      renderExplorer();
      runMockAllotmentSimulation();
      showToast(`Auto-filled ${appState.priorityList.length} balanced Dream/Target/Safe options for Rank ${targetRank.toLocaleString("en-IN")} (${appState.category})!`, "🪄");
    }

    function downloadPriorityPdf() {
      if (appState.priorityList.length === 0) {
        showToast("Add colleges to your Priority Sheet before downloading PDF!", "⚠️");
        return;
      }

      const card = document.getElementById("priority-printable-card");
      const filename = `My_BTech_Web_Options_${appState.category}.pdf`;
      showToast(`Generating ${filename}...`, "📥");

      if (window.html2pdf) {
        const opt = {
          margin: 0.35,
          filename: filename,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: "in", format: "a4", orientation: "portrait" }
        };
        window.html2pdf().set(opt).from(card).save().catch(() => {
          window.print();
        });
      } else {
        window.print();
      }
    }

    // =========================================================================
    // 7. STEP 8 NEW FEATURES: 4-YR ROI CALCULATOR & CATEGORY CUTOFF MATRIX
    // =========================================================================
    function getBranchTier(code) {
      const c = (code || "").toUpperCase();
      // Computing, AI, Software & Specialized Tech Tier
      if (["CSE", "AIDS", "AIML", "CS", "IT", "MNC", "ISE", "AI", "CSBS", "CSD", "CYBER", "CSC", "DATA", "IOT", "SE"].some(x => c.includes(x))) {
        return {
          tier: "computing",
          tierTag: "AI & Tech Tier",
          name: "AI & Computing Tier",
          multiplier: 1.20,
          paymentMultiplier: 1.35,
          badgeClass: "bg-purple-100 text-purple-900 border border-purple-300 font-bold"
        };
      }
      // Circuit & Modern Electronics / Specialized Tech
      if (["ECE", "EEE", "EE", "VLSI", "EIE", "ROBOTICS", "AERO", "AUTO", "BME"].some(x => c.includes(x))) {
        return {
          tier: "circuit",
          tierTag: "Circuit & Tech Tier",
          name: "Circuit & Specialized Tech",
          multiplier: 1.00,
          paymentMultiplier: 1.00,
          badgeClass: "bg-blue-100 text-blue-900 border border-blue-300 font-bold"
        };
      }
      // Core Engineering & Allied Sciences (Discounted)
      return {
        tier: "core",
        tierTag: "Core Discount Tier",
        name: "Core Engineering Tier (Discounted)",
        multiplier: 0.85,
        paymentMultiplier: 0.80,
        badgeClass: "bg-amber-100 text-amber-900 border border-amber-300 font-bold"
      };
    }

    function renderCollegeSuggestions(filterQuery = "") {
      const sugContainer = document.getElementById("roi-college-suggestions");
      if (!sugContainer) return;

      const q = (filterQuery || "").toLowerCase().trim();
      let matches = collegesData;
      if (q) {
        matches = collegesData.filter(c =>
          c.code.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q) ||
          (c.district && c.district.toLowerCase().includes(q)) ||
          (c.region && c.region.toLowerCase().includes(q)) ||
          (c.location && c.location.toLowerCase().includes(q))
        );
      }

      if (matches.length === 0) {
        sugContainer.innerHTML = `
          <div class="p-4 text-center text-xs text-slate-500 font-medium">
            No colleges matching "<strong>${escapeHtml(filterQuery)}</strong>"<br>
            <span class="text-[11px] text-slate-400">Try searching AUCE, BITS, VIT, Gayatri, or district name.</span>
          </div>
        `;
        sugContainer.classList.remove("hidden");
        return;
      }

      const displayList = matches.slice(0, 40);
      sugContainer.innerHTML = displayList.map(c => `
        <div class="roi-college-sug-item p-2.5 hover:bg-blue-50 cursor-pointer flex items-center justify-between text-xs transition border-b border-slate-100 last:border-b-0" data-college-id="${c.id}">
          <div class="pr-2 min-w-0">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="font-extrabold text-blue-900 bg-blue-100 px-1.5 py-0.5 rounded text-[11px] font-mono">${c.code}</span>
              <span class="font-bold text-slate-800 truncate">${c.name}</span>
            </div>
            <span class="text-slate-500 block text-[10px] mt-0.5">${c.district || c.region} • ${c.type || "College"} • Grade: ${c.grade} • ${c.rating}</span>
          </div>
          <div class="text-right whitespace-nowrap pl-2 flex-shrink-0">
            <span class="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded block font-mono">${(c.fees && c.fees.annualTuition) ? c.fees.annualTuition.split('/')[0].trim() : '₹45,000'}</span>
            <span class="text-[9px] text-slate-400 mt-0.5 block">${(c.branches || []).length} branches</span>
          </div>
        </div>
      `).join("");

      if (matches.length > 40) {
        sugContainer.innerHTML += `
          <div class="p-2 text-center text-[10px] text-slate-400 bg-slate-50">
            Showing top 40 of ${matches.length} matching colleges. Type to refine.
          </div>
        `;
      }

      sugContainer.classList.remove("hidden");
    }

    function selectRoiCollege(collegeId, triggerRecalc = true) {
      const college = collegesData.find(c => c.id === collegeId) || collegesData[0];
      if (!college) return;

      const colSearch = document.getElementById("roi-college-search");
      const colSelect = document.getElementById("roi-college-select");
      const matSelect = document.getElementById("matrix-college-select");
      const sugContainer = document.getElementById("roi-college-suggestions");

      if (colSearch) {
        colSearch.value = `${college.code} — ${college.name} (${college.district || college.region})`;
      }
      if (colSelect) {
        colSelect.value = college.id;
      }
      if (matSelect) {
        matSelect.value = college.id;
      }
      if (sugContainer) {
        sugContainer.classList.add("hidden");
      }

      populateRoiBranches(college.id);

      if (triggerRecalc) {
        renderRoiCalculator();
        renderCutoffMatrix();
      }
    }

    function renderBranchSuggestions(filterQuery = "") {
      const colSelect = document.getElementById("roi-college-select");
      const collegeId = colSelect ? colSelect.value : (collegesData[0] ? collegesData[0].id : "");
      const college = collegesData.find(c => c.id === collegeId) || collegesData[0];
      const branches = (college && college.branches) ? college.branches : [];

      const sugContainer = document.getElementById("roi-branch-suggestions");
      if (!sugContainer) return;

      const q = (filterQuery || "").toLowerCase().trim();
      let matches = branches;
      if (q) {
        matches = branches.filter(br =>
          br.code.toLowerCase().includes(q) ||
          br.name.toLowerCase().includes(q)
        );
      }

      if (matches.length === 0) {
        sugContainer.innerHTML = `
          <div class="p-3 text-center text-xs text-slate-500 font-medium">
            ⚡ No branches matching "<strong>${escapeHtml(filterQuery)}</strong>" in ${college.code}
          </div>
        `;
        sugContainer.classList.remove("hidden");
        return;
      }

      sugContainer.innerHTML = matches.map(br => {
        const tier = getBranchTier(br.code);
        return `
          <div class="roi-branch-sug-item p-2.5 hover:bg-amber-50 cursor-pointer flex items-center justify-between text-xs transition border-b border-slate-100 last:border-b-0" data-branch-code="${br.code}">
            <div class="flex items-center gap-2 pr-2">
              <span class="font-black text-slate-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded text-[11px] font-mono">${br.code}</span>
              <div>
                <span class="font-bold text-slate-800">${br.name}</span>
                <span class="block text-[10px] text-slate-500 font-medium">${tier.name}</span>
              </div>
            </div>
            <span class="text-[10px] px-2 py-0.5 rounded-full font-bold ${tier.badgeClass} flex-shrink-0">${tier.tierTag}</span>
          </div>
        `;
      }).join("");

      sugContainer.classList.remove("hidden");
    }

    function selectRoiBranch(branchCode) {
      const colSelect = document.getElementById("roi-college-select");
      const collegeId = colSelect ? colSelect.value : (collegesData[0] ? collegesData[0].id : "");
      const college = collegesData.find(c => c.id === collegeId) || collegesData[0];
      const branches = (college && college.branches) ? college.branches : [];

      const br = branches.find(b => b.code === branchCode) || branches[0];
      if (!br) return;

      const brSearch = document.getElementById("roi-branch-search");
      const brSelect = document.getElementById("roi-branch-select");
      const sugContainer = document.getElementById("roi-branch-suggestions");

      if (brSearch) {
        brSearch.value = `${br.code} — ${br.name}`;
      }
      if (brSelect) {
        brSelect.value = br.code;
      }
      if (sugContainer) {
        sugContainer.classList.add("hidden");
      }

      renderRoiCalculator();
    }

    function populateAnalyticsDropdowns() {
      const colSelect = document.getElementById("roi-college-select");
      const matSelect = document.getElementById("matrix-college-select");
      if (!colSelect || !matSelect) return;

      colSelect.innerHTML = collegesData.map(c =>
        `<option value="${c.id}">${c.code} — ${c.name} (${c.district || c.region})</option>`
      ).join("");

      matSelect.innerHTML = collegesData.map(c =>
        `<option value="${c.id}">${c.code} — ${c.name} (${c.district || c.region})</option>`
      ).join("");

      const activeCollegeId = colSelect.value || collegesData[0].id;
      selectRoiCollege(activeCollegeId, false);
    }

    function populateRoiBranches(collegeId) {
      const college = collegesData.find(c => c.id === collegeId) || collegesData[0];
      const branches = (college && Array.isArray(college.branches) && college.branches.length > 0)
        ? college.branches
        : [
            { code: "CSE", name: "Computer Science & Engineering", closingRank: 3500 },
            { code: "AIML", name: "Artificial Intelligence & Machine Learning", closingRank: 4200 },
            { code: "AIDS", name: "AI & Data Science", closingRank: 5000 },
            { code: "ECE", name: "Electronics & Communication", closingRank: 7500 },
            { code: "EEE", name: "Electrical & Electronics", closingRank: 12000 },
            { code: "MECH", name: "Mechanical Engineering", closingRank: 18000 },
            { code: "CIVIL", name: "Civil Engineering", closingRank: 22000 }
          ];

      const badge = document.getElementById("roi-branch-count-badge");
      if (badge) badge.textContent = `${branches.length} Branches Available`;

      const brSelect = document.getElementById("roi-branch-select");
      if (brSelect) {
        brSelect.innerHTML = branches.map(br => {
          const tier = getBranchTier(br.code);
          return `<option value="${br.code}">${br.code} — ${br.name} (${tier.tierTag})</option>`;
        }).join("");
      }

      const brSearch = document.getElementById("roi-branch-search");
      const currentBranchCode = brSelect ? brSelect.value : "";
      const chosenBranch = branches.find(b => b.code === currentBranchCode) || branches[0];

      if (brSelect && chosenBranch) {
        brSelect.value = chosenBranch.code;
      }
      if (brSearch && chosenBranch) {
        brSearch.value = `${chosenBranch.code} — ${chosenBranch.name}`;
      }
    }

    function renderRoiCalculator() {
      const collegeSelect = document.getElementById("roi-college-select");
      const collegeId = collegeSelect?.value || collegesData[0].id;
      const college = collegesData.find(c => c.id === collegeId) || collegesData[0];

      let branchSelect = document.getElementById("roi-branch-select");
      if (!branchSelect || !branchSelect.options.length) {
        populateRoiBranches(collegeId);
        branchSelect = document.getElementById("roi-branch-select");
      }

      const branchCode = branchSelect?.value || (college.branches && college.branches[0]?.code) || "CSE";
      const branches = college.branches || [];
      const selectedBranch = branches.find(b => b.code === branchCode) || branches[0] || { code: "CSE", name: "Computer Science & Engineering", closingRank: 3500 };

      const quota = document.getElementById("roi-quota-select")?.value || "ap_cet";
      const waiverPct = parseInt(document.getElementById("roi-scholarship-select")?.value || "0", 10);
      const stayMode = document.getElementById("roi-stay-select")?.value || "campus";
      const vasathiEligible = document.getElementById("roi-jvd-vasathi")?.value === "yes";

      const tier = getBranchTier(selectedBranch.code);
      let quotaLabel = "";
      let quotaBadge = "";
      let quotaHint = "";
      let annualTuitionBeforeWaiver = 0;

      const baseTuition = college.fees.numTuition || 45000;

      if (quota === "ap_cet") {
        quotaLabel = "AP EAPCET Convener Quota";
        quotaBadge = "State Convener Quota (AP CET)";
        quotaHint = "";
        annualTuitionBeforeWaiver = Math.round(baseTuition * tier.multiplier);
      } else if (quota === "jee") {
        quotaLabel = "JEE Main / Advanced National Merit Quota";
        quotaBadge = "JEE Central / National Merit Quota";
        quotaHint = "National Central Merit Quota: Central JoSAA/IIT/NIT structure with fee remission slabs.";
        const isCentral = college.category === "Central" || (college.fees.numTuition && college.fees.numTuition > 100000);
        const jeeBase = isCentral ? (college.fees.numTuition || 150000) : Math.max(120000, Math.round(baseTuition * 1.6));
        annualTuitionBeforeWaiver = Math.round(jeeBase * tier.multiplier);
      } else {
        quotaLabel = "Category-B Management / Payment Seat";
        quotaBadge = "Direct Payment Seat (B-Category)";
        quotaHint = "Category-B Direct Admission: Institutional quota fee with merit discounts for Inter MPC scores.";
        const payBase = Math.max(220000, Math.round(baseTuition * 3.4));
        annualTuitionBeforeWaiver = Math.round(payBase * tier.paymentMultiplier);
      }

      const hintEl = document.getElementById("roi-quota-hint");
      if (hintEl) hintEl.textContent = quotaHint;

      const netAnnualTuition = Math.round(annualTuitionBeforeWaiver * (1 - waiverPct / 100));
      const semTuition = Math.round(netAnnualTuition / 2);
      const fourYrTuition = netAnnualTuition * 4;

      let annualStay = 0;
      if (stayMode === "campus") annualStay = college.fees.numHostel || 30000;
      if (stayMode === "pg") annualStay = 64000;
      if (vasathiEligible && annualStay > 0) annualStay = Math.max(0, annualStay - 20000);
      const fourYrStay = annualStay * 4;

      const fourYrBooksExamTransit = 48000;
      const total4YrCost = fourYrTuition + fourYrStay + fourYrBooksExamTransit;

      const baseMedianLpa = college.placements.numMedianPkg || 4.5;
      const branchSalaryFactor = (tier.tier === "computing") ? 1.15 : ((tier.tier === "core") ? 0.90 : 1.00);
      const branchMedianLpa = Math.round((baseMedianLpa * branchSalaryFactor) * 10) / 10;
      const annualSalaryInr = branchMedianLpa * 100000;
      const monthlyInHand = Math.round((annualSalaryInr * 0.85) / 12);
      const paybackMonths = total4YrCost <= 0 ? 1 : Math.max(1, Math.round(total4YrCost / monthlyInHand));

      const roiBadge = paybackMonths <= 8
        ? `<span class="bg-emerald-400 text-slate-950 font-extrabold px-2.5 py-0.5 rounded-full text-xs">⚡ Exceptional ROI (${paybackMonths} Months Payback)</span>`
        : (paybackMonths <= 18
          ? `<span class="bg-amber-400 text-slate-950 font-extrabold px-2.5 py-0.5 rounded-full text-xs">👍 Strong Value ROI (${paybackMonths} Months Payback)</span>`
          : `<span class="bg-rose-400 text-slate-950 font-extrabold px-2.5 py-0.5 rounded-full text-xs">⏳ Moderate ROI (${paybackMonths} Months Payback)</span>`);

      const panel = document.getElementById("roi-result-panel");
      if (!panel) return;

      panel.innerHTML = `
        <div>
          <div class="flex items-center justify-between flex-wrap gap-2 mb-3">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-xs uppercase font-extrabold tracking-wider text-blue-300">${college.code}</span>
              <span class="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-blue-500/30 text-blue-200 border border-blue-400/40">${quotaBadge}</span>
              <span class="text-[11px] px-2.5 py-0.5 rounded-full font-bold ${tier.badgeClass}">${selectedBranch.code} • ${tier.name}</span>
            </div>
            ${roiBadge}
          </div>

          <h4 class="text-lg sm:text-xl font-extrabold text-white">${college.name}</h4>
          <p class="text-xs text-blue-200 mt-0.5">
            Target Branch: <strong>${selectedBranch.name} (${selectedBranch.code})</strong> • Verified 2025 Placement Rate: <strong>${college.placements.placementRate}</strong> • Rating: <strong>${college.rating} (${college.grade})</strong>
          </p>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
            <div class="bg-gradient-to-br from-indigo-900/70 to-blue-900/70 p-3 rounded-xl border border-indigo-400/40">
              <span class="text-[10px] uppercase font-bold text-indigo-200 block">Tuition / Semester</span>
              <strong class="text-base sm:text-lg font-black text-white">₹${semTuition.toLocaleString("en-IN")} <span class="text-xs font-normal text-indigo-200">/sem</span></strong>
              <span class="block text-[10px] text-indigo-300 font-semibold mt-0.5">₹${netAnnualTuition.toLocaleString("en-IN")} / year</span>
            </div>

            <div class="bg-white/10 p-3 rounded-xl border border-white/10">
              <span class="text-[10px] uppercase text-blue-200 block">4-Yr Net Tuition</span>
              <strong class="text-sm sm:text-base font-extrabold text-white">₹${fourYrTuition.toLocaleString("en-IN")}</strong>
              <span class="block text-[10px] text-emerald-300">${waiverPct > 0 ? `${waiverPct}% Waiver Applied` : "Standard Fee Tier"}</span>
            </div>

            <div class="bg-white/10 p-3 rounded-xl border border-white/10">
              <span class="text-[10px] uppercase text-blue-200 block">4-Yr Hostel / Stay</span>
              <strong class="text-sm sm:text-base font-extrabold text-white">₹${fourYrStay.toLocaleString("en-IN")}</strong>
              <span class="block text-[10px] text-blue-200">${vasathiEligible ? "Vasathi ₹80K Saved" : (stayMode === "dayscholar" ? "Day Scholar ₹0" : stayMode)}</span>
            </div>

            <div class="bg-amber-400/20 p-3 rounded-xl border border-amber-400/40">
              <span class="text-[10px] uppercase text-amber-200 block">Total 4-Yr Outlay</span>
              <strong class="text-sm sm:text-base font-extrabold text-amber-300">₹${total4YrCost.toLocaleString("en-IN")}</strong>
              <span class="block text-[10px] text-amber-200">Incl. Books & Exams</span>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div class="bg-emerald-500/20 p-3 rounded-xl border border-emerald-400/40 flex items-center justify-between">
              <div>
                <span class="text-[10px] uppercase text-emerald-200 font-bold block">${selectedBranch.code} Median Starting CTC</span>
                <strong class="text-base font-black text-emerald-300">₹${branchMedianLpa.toFixed(1)} LPA</strong>
              </div>
              <div class="text-right">
                <span class="text-[10px] text-emerald-200 block">Estimated Take-Home</span>
                <span class="text-xs font-bold text-white">~₹${monthlyInHand.toLocaleString("en-IN")} / mo</span>
              </div>
            </div>

            <div class="bg-blue-500/20 p-3 rounded-xl border border-blue-400/40 flex items-center justify-between">
              <div>
                <span class="text-[10px] uppercase text-blue-200 font-bold block">Payback Recovery Time</span>
                <strong class="text-base font-black text-cyan-300">~${paybackMonths} Months</strong>
              </div>
              <div class="text-right text-[11px] text-blue-200">
                From Starting Salary
              </div>
            </div>
          </div>
        </div>

        <div class="pt-3 border-t border-white/15 flex items-center justify-end flex-wrap gap-3 text-xs">
          <button type="button" data-action="quick-add-branch" data-college-id="${college.id}" data-branch-code="${selectedBranch.code}" class="px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition">
            + Add ${college.code} (${selectedBranch.code}) to Priority Sheet
          </button>
        </div>
      `;
    }

    function renderCutoffMatrix() {
      const collegeId = document.getElementById("matrix-college-select").value || collegesData[0].id;
      const roundFactor = parseFloat(document.getElementById("matrix-round-select").value || "1");
      const college = collegesData.find(c => c.id === collegeId) || collegesData[0];
      const tbody = document.getElementById("cutoff-matrix-tbody");

      const cats = ["OC", "EWS", "BC_A", "BC_B", "BC_C", "BC_D", "BC_E", "SC", "ST"];

      tbody.innerHTML = college.branches.map(br => {
        const inPriority = appState.priorityList.some(p => p.collegeId === college.id && p.branchCode === br.code);
        const cells = cats.map(cat => {
          const val = Math.min(350000, Math.round(getScaledCutoff(br.closingRank, cat, college.exam) * roundFactor));
          const isUserQualifying = appState.rank && appState.rank <= val;
          return `<td class="p-3 text-right font-mono ${
            cat === appState.category ? "bg-blue-50 font-extrabold text-blue-900" : "text-slate-700"
          } ${isUserQualifying ? "text-emerald-700 font-bold" : ""}">
            ${val.toLocaleString("en-IN")}
          </td>`;
        }).join("");

        return `
          <tr class="hover:bg-slate-50 transition">
            <td class="p-3 font-bold text-slate-900">
              <span class="inline-block w-12 font-extrabold text-blue-800">${br.code}</span>
              <span class="text-slate-600 font-medium">${br.name}</span>
            </td>
            ${cells}
            <td class="p-3 text-center">
              <button type="button" data-action="quick-add-branch" data-college-id="${college.id}" data-branch-code="${br.code}"
                class="px-2.5 py-1 rounded-lg ${
                  inPriority
                    ? "bg-slate-900 hover:bg-rose-950 text-amber-300 hover:text-rose-200 border border-slate-800 hover:border-rose-700"
                    : "bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white border border-emerald-300"
                } font-bold text-[11px] transition cursor-pointer" title="${inPriority ? "Click to remove " + college.code + " (" + br.code + ") from Priority Sheet" : "Click to add " + college.code + " (" + br.code + ")"}">
                ${inPriority ? "✓ Added" : `+ Add ${br.code}`}
              </button>
            </td>
          </tr>
        `;
      }).join("");
    }

    // =========================================================================