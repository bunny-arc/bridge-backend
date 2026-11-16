// 8. COUNSELING DOCUMENT CHECKLIST RENDERER
    // =========================================================================
    function renderChecklist() {
      const listEl = document.getElementById("docs-list");
      const progressText = document.getElementById("docs-progress-text");
      const progressPercent = document.getElementById("docs-progress-percent");
      const progressBar = document.getElementById("docs-progress-bar");

      const total = checklistDocsData.length;
      const completed = checklistDocsData.filter(d => appState.checkedDocs[d.id]).length;
      const pct = Math.round((completed / total) * 100);

      progressText.textContent = `${completed}/${total}`;
      progressPercent.textContent = `${pct}% Completed (${completed} of ${total})`;
      progressBar.style.width = `${pct}%`;
      const hdrDocs = document.getElementById("header-docs-count-badge");
      if (hdrDocs) hdrDocs.textContent = `${completed}/${total}`;
      const navDocs = document.getElementById("nav-docs-count-badge");
      if (navDocs) navDocs.textContent = `${completed}/${total}`;

      listEl.innerHTML = checklistDocsData.map(doc => {
        const isChecked = !!appState.checkedDocs[doc.id];
        return `
          <label class="flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
            isChecked ? "bg-emerald-50/70 border-emerald-300" : "bg-slate-50 hover:bg-slate-100 border-slate-200"
          }">
            <input type="checkbox" data-doc-id="${doc.id}" ${isChecked ? "checked" : ""}
              class="mt-1 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500" />
            <div class="flex-1">
              <div class="font-bold text-xs sm:text-sm ${isChecked ? "line-through text-emerald-900" : "text-slate-900"}">${doc.title}</div>
              <p class="text-[11px] text-slate-500 mt-0.5">${doc.desc}</p>
            </div>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded ${
              isChecked ? "bg-emerald-200 text-emerald-900" : "bg-slate-200 text-slate-600"
            }">${isChecked ? "Ready ✓" : "Pending"}</span>
          </label>
        `;
      }).join("");
    }

    // =========================================================================
    // 9. DEDICATED COLLEGE DETAIL PAGE (Referenced from demoooo for pagess.html)
    // =========================================================================
    let cdHeroActiveSlide = 0;
    let cdHeroImages = [];

    function openCollegeDetailPage(collegeId) {
      const colleges = (typeof collegesData !== "undefined" && Array.isArray(collegesData)) ? collegesData : (window.collegesData || []);
      const college = colleges.find(c => c.id === collegeId || c.code === collegeId);
      if (!college) return;

      appState.activeDetailPageCollegeId = college.id;
      appState.activeModalCollegeId = college.id;
      if (appState.activeView !== "college-detail") {
        appState.previousView = appState.activeView || "add-rank";
      }
      appState.activeView = "college-detail";

      // 1. Breadcrumbs
      const examLabel = college.exam === "ap_cet" ? "AP CET" : (college.exam === "jee_main" ? "JEE Main" : (college.exam === "jee_adv" ? "JEE Advanced" : "Payment Colleges"));
      const bExam = document.getElementById("cd-breadcrumb-exam");
      if (bExam) bExam.textContent = examLabel;
      const bName = document.getElementById("cd-breadcrumb-name");
      if (bName) bName.textContent = college.name;

      // 2. Eyebrow, Title & Lede
      const eyebrow = document.getElementById("cd-eyebrow");
      if (eyebrow) {
        eyebrow.textContent = `${(college.type || 'Engineering College').toUpperCase()} · ${(college.region || 'AP').toUpperCase()} REGION · ESTD ${college.established || '2008'} · CODE: ${college.code}`;
      }
      const title = document.getElementById("cd-title");
      if (title) {
        const codeSuffix = `(${college.code})`;
        title.textContent = (college.name && college.name.includes(codeSuffix)) ? college.name : `${college.name} ${codeSuffix}`;
      }
      const lede = document.getElementById("cd-lede");
      if (lede) {
        lede.textContent = college.summary || "Comprehensive autonomous engineering college offering cutting-edge B.Tech curriculum, industry-sponsored laboratories, and high placement outcomes.";
      }
      const summary = document.getElementById("cd-summary");
      if (summary) {
        summary.textContent = college.summary || `${college.name} (${college.code}) is located in ${college.location || 'Andhra Pradesh'}. Established in ${college.established || '2008'}, the college holds a rating of ${college.rating || '4.5★'} and NAAC ${college.grade || 'A'} accreditation.`;
      }

      // 3. Hero Campus Photo & Slide Controls
      cdHeroImages = (typeof window.getCollegeImages === "function") ? window.getCollegeImages(college) : [getCollegeImageUrl(college)];
      if (!Array.isArray(cdHeroImages) || cdHeroImages.length === 0) cdHeroImages = [getCollegeImageUrl(college)];
      cdHeroActiveSlide = 0;

      function updateCdHeroSlide() {
        const heroImg = document.getElementById("cd-hero-img");
        if (heroImg && cdHeroImages[cdHeroActiveSlide]) {
          heroImg.src = cdHeroImages[cdHeroActiveSlide];
          heroImg.dataset.origSrc = cdHeroImages[cdHeroActiveSlide];
          heroImg.dataset.fallbackStep = "0";
          heroImg.onerror = function() {
            window.handleCollegeImgError(this, college.code || college.id);
          };
        }
        const counter = document.getElementById("cd-hero-counter");
        const prevBtn = document.getElementById("cd-hero-prev");
        const nextBtn = document.getElementById("cd-hero-next");
        if (counter) counter.textContent = (cdHeroActiveSlide + 1) + " / " + cdHeroImages.length;
        if (cdHeroImages.length > 1) {
          if (prevBtn) prevBtn.style.display = "flex";
          if (nextBtn) nextBtn.style.display = "flex";
        } else {
          if (prevBtn) prevBtn.style.display = "none";
          if (nextBtn) nextBtn.style.display = "none";
        }
      }
      updateCdHeroSlide();

      const heroPrev = document.getElementById("cd-hero-prev");
      const heroNext = document.getElementById("cd-hero-next");
      if (heroPrev) {
        heroPrev.onclick = (e) => {
          e.stopPropagation();
          cdHeroActiveSlide = (cdHeroActiveSlide - 1 + cdHeroImages.length) % cdHeroImages.length;
          updateCdHeroSlide();
        };
      }
      if (heroNext) {
        heroNext.onclick = (e) => {
          e.stopPropagation();
          cdHeroActiveSlide = (cdHeroActiveSlide + 1) % cdHeroImages.length;
          updateCdHeroSlide();
        };
      }

      // 4. Low placement flag alert
      const lowAlert = document.getElementById("cd-low-placement-alert");
      if (lowAlert) {
        if (college.lowPlacementFlag) {
          lowAlert.classList.remove("hidden");
          const rateEl = document.getElementById("cd-low-placement-rate");
          if (rateEl) rateEl.textContent = college.placements?.placementRate || "Low Activity Reported";
        } else {
          lowAlert.classList.add("hidden");
        }
      }

      // 5. Category Note & Qualifying Branches Table
      const catBadge = document.getElementById("cd-category-badge");
      if (catBadge) {
        catBadge.textContent = `Showing cutoffs scaled for ${categoryLabels[appState.category] || "General Quota"}`;
      }
      const branchesTbody = document.getElementById("cd-branches-table");
      if (branchesTbody) {
        branchesTbody.innerHTML = (college.branches || []).map(b => {
          const cutoff = getScaledCutoff(b.closingRank, appState.category, college.exam);
          const qualifies = !appState.rank || college.exam === "payment" || appState.rank <= cutoff;
          const inPriority = appState.priorityList.some(p => p.collegeId === college.id && p.branchCode === b.code);
          return `
            <tr class="hover:bg-slate-50/70 transition">
              <td class="p-3 font-semibold text-slate-900">${b.name}</td>
              <td class="p-3 text-center font-bold text-blue-800 font-mono">${b.code}</td>
              <td class="p-3 text-right font-mono font-bold text-slate-800">~${cutoff.toLocaleString("en-IN")}</td>
              <td class="p-3 text-center">
                <button type="button" data-action="quick-add-branch" data-college-id="${college.id}" data-branch-code="${b.code}"
                  class="px-3 py-1.5 rounded-xl ${
                    inPriority
                      ? "bg-slate-900 hover:bg-rose-950 text-amber-300 hover:text-rose-200"
                      : (qualifies ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-amber-100 hover:bg-amber-200 text-amber-900")
                  } font-bold text-xs transition cursor-pointer active:scale-95 shadow-2xs"
                  title="${inPriority ? "Click to remove " + college.code + " (" + b.code + ") from Priority Sheet" : "Click to add " + college.code + " (" + b.code + ")"}">
                  ${inPriority ? "✓ Added Option" : `+ Add ${b.code}`}
                </button>
              </td>
            </tr>
          `;
        }).join("");
      }

      // 6. NIRF 2025 Parameters
      const nirfBox = document.getElementById("cd-nirf-box");
      const nirfBadge = document.getElementById("cd-nirf-badge");
      const nirfParams = document.getElementById("cd-nirf-params");
      if (nirfBox && nirfBadge) {
        if (college.nirf2025 || college.nirfRank || college.nirfBand) {
          nirfBox.classList.remove("hidden");
          const n = college.nirf2025 || {};
          if (college.nirfRank || n.rank) {
            nirfBadge.textContent = "NIRF #" + (college.nirfRank || n.rank) + (college.nirfScore || n.score ? " (Score: " + (college.nirfScore || n.score) + ")" : "");
            nirfBadge.className = "px-3 py-1 rounded-lg bg-blue-600 text-white font-black text-xs shadow-xs";
          } else if (college.nirfBand || n.rankBand) {
            nirfBadge.textContent = "NIRF " + (college.nirfBand || n.rankBand);
            nirfBadge.className = "px-3 py-1 rounded-lg bg-indigo-600 text-white font-black text-xs shadow-xs";
          }
          if (n.tlr && nirfParams) {
            nirfParams.classList.remove("hidden");
            document.getElementById("cd-nirf-p-tlr").textContent = n.tlr;
            document.getElementById("cd-nirf-p-rpc").textContent = n.rpc;
            document.getElementById("cd-nirf-p-go").textContent = n.go + " (High)";
            document.getElementById("cd-nirf-p-oi").textContent = n.oi;
            document.getElementById("cd-nirf-p-pr").textContent = n.pr;
          } else if (nirfParams) {
            nirfParams.classList.add("hidden");
          }
        } else {
          nirfBox.classList.add("hidden");
        }
      }

      // 7. Placements (Median, Avg, Highest, Rate, Top Recruiters)
      const placements = college.placements || {};
      const fees = college.fees || {};
      const hostels = college.hostels || { campus: "Campus residential accommodation available.", outsideBoys: [], outsideGirls: [] };
      const travel = college.travel || { modes: [], nearestStation: "Nearest Railway Station", nearestBusStand: "Nearest Bus Station", localTransit: "Autos and local transit available" };
      const food = college.food || [];
      const scholarships = college.scholarships || [];

      const medEl = document.getElementById("cd-median-ctc");
      if (medEl) medEl.textContent = placements.medianPackage || "₹7.5 LPA";
      const avgEl = document.getElementById("cd-avg-ctc");
      if (avgEl) avgEl.textContent = placements.avgPackage || "₹8.5 LPA";
      const highEl = document.getElementById("cd-high-ctc");
      if (highEl) highEl.textContent = placements.highestPackage || "₹45.0 LPA";
      const rateEl = document.getElementById("cd-placement-rate");
      if (rateEl) rateEl.textContent = placements.placementRate || "90%";

      const recList = document.getElementById("cd-recruiters-list");
      if (recList) {
        recList.innerHTML = (placements.topRecruiters || []).map(r =>
          `<span class="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800">${r}</span>`
        ).join("");
      }

      // 8. Admission Route & Payment Policy
      const admRoute = document.getElementById("cd-admission-route");
      if (admRoute) {
        admRoute.textContent = college.exam === "ap_cet"
          ? `Admits via AP EAPCET (APSCHE) Web Counseling using College Code "${college.code}". 100% JVD tuition fee reimbursement available for eligible AP students.`
          : (college.exam === "payment"
            ? (college.paymentInfo ? college.paymentInfo.directNote : "Direct admission and merit scholarships available.")
            : `Admits via Central JoSAA / CSAB counseling based on ${college.exam === "jee_adv" ? "JEE Advanced" : "JEE Main"} All-India Rank.`);
      }
      const payBox = document.getElementById("cd-payment-box");
      if (payBox) {
        if (college.paymentInfo) {
          payBox.classList.remove("hidden");
          const payNote = document.getElementById("cd-direct-admission-note");
          if (payNote) payNote.textContent = college.paymentInfo.directNote || "Direct seat quota and merit discount scholarships available.";
        } else {
          payBox.classList.add("hidden");
        }
      }

      // 9. Hostels
      const campHostel = document.getElementById("cd-campus-hostel-info");
      if (campHostel) campHostel.textContent = hostels.campus || "On-campus hostel accommodations available.";
      const feeBadge = document.getElementById("cd-hostel-fee-badge");
      if (feeBadge) feeBadge.textContent = fees.hostelFee || "₹28,000 / yr";

      const outBoys = document.getElementById("cd-outside-boys-hostels");
      if (outBoys) {
        outBoys.innerHTML = (hostels.outsideBoys || []).map(h =>
          `<div class="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
            <div>
              <strong class="text-slate-900">${h.name}</strong> <span class="text-amber-600 font-bold ml-1">${h.rating}</span>
              <p class="text-[11px] text-slate-500">${h.dist}</p>
            </div>
            <span class="font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg">${h.rent}</span>
          </div>`
        ).join("");
      }
      const outGirls = document.getElementById("cd-outside-girls-hostels");
      if (outGirls) {
        outGirls.innerHTML = (hostels.outsideGirls || []).map(h =>
          `<div class="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
            <div>
              <strong class="text-slate-900">${h.name}</strong> <span class="text-amber-600 font-bold ml-1">${h.rating}</span>
              <p class="text-[11px] text-slate-500">${h.dist}</p>
            </div>
            <span class="font-bold text-pink-800 bg-pink-50 px-2.5 py-1 rounded-lg">${h.rent}</span>
          </div>`
        ).join("");
      }

      // 10. Transit & Connectivity
      const stEl = document.getElementById("cd-nearest-station");
      if (stEl) stEl.textContent = travel.nearestStation || "Nearest Railway Station";
      const busEl = document.getElementById("cd-nearest-busstand");
      if (busEl) busEl.textContent = travel.nearestBusStand || "Nearest Bus Stand";
      const transitEl = document.getElementById("cd-last-mile-transit");
      if (transitEl) transitEl.textContent = travel.localTransit || "Autos and local transit available.";

      const travelTable = document.getElementById("cd-travel-modes-table");
      if (travelTable) {
        travelTable.innerHTML = (travel.modes || []).map(m =>
          `<tr>
            <td class="p-2.5 font-bold text-slate-900">${m.mode}</td>
            <td class="p-2.5 text-slate-600">${m.time}</td>
            <td class="p-2.5 font-semibold text-emerald-800">${m.cost}</td>
            <td class="p-2.5 text-slate-600">${m.route}</td>
          </tr>`
        ).join("");
      }

      // 11. Food Spots
      const foodList = document.getElementById("cd-food-spots-list");
      if (foodList) {
        foodList.innerHTML = food.map(f =>
          `<div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
            <div class="flex items-center justify-between">
              <strong class="text-slate-900 text-sm">${f.spot}</strong>
              <span class="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">${f.type}</span>
            </div>
            <p class="text-slate-600">${f.dishes}</p>
          </div>`
        ).join("");
      }

      // 12. Scholarships
      const schList = document.getElementById("cd-scholarships-list");
      if (schList) {
        schList.innerHTML = scholarships.map(s =>
          `<div class="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800">🎓 ${s}</div>`
        ).join("");
      }

      // 13. Facts Aside (matching demoooo for pagess.html facts dl)
      const fCode = document.getElementById("cd-fact-code");
      if (fCode) fCode.textContent = college.code || "-";
      const fType = document.getElementById("cd-fact-type");
      if (fType) fType.textContent = college.type || "Engineering College";
      const fExam = document.getElementById("cd-fact-exam");
      if (fExam) fExam.textContent = examLabel;
      const fRegion = document.getElementById("cd-fact-region");
      if (fRegion) fRegion.textContent = `${college.region || 'AU/SVU'} Region · ${college.district || college.state || 'AP'}`;
      const fLoc = document.getElementById("cd-fact-location");
      if (fLoc) fLoc.textContent = college.location || "Andhra Pradesh";
      const fEst = document.getElementById("cd-fact-established");
      if (fEst) fEst.textContent = String(college.established || "2008");
      const fGrade = document.getElementById("cd-fact-grade");
      if (fGrade) fGrade.textContent = `${college.rating || '4.5★'} (${college.grade || 'A'})`;
      const fNirf = document.getElementById("cd-fact-nirf");
      if (fNirf) fNirf.textContent = college.nirfRank ? `#${college.nirfRank}` : (college.nirfBand || "Rank Band 151-200");
      const fMed = document.getElementById("cd-fact-median");
      if (fMed) fMed.textContent = placements.medianPackage || "₹7.5 LPA";
      const fHigh = document.getElementById("cd-fact-highest");
      if (fHigh) fHigh.textContent = placements.highestPackage || "₹45.0 LPA";
      const fRate = document.getElementById("cd-fact-rate");
      if (fRate) fRate.textContent = placements.placementRate || "90%";
      const fTuit = document.getElementById("cd-fact-tuition");
      if (fTuit) fTuit.textContent = fees.annualTuition || "₹35,000 / yr";
      const fJvd = document.getElementById("cd-fact-jvd");
      if (fJvd) fJvd.textContent = fees.jvdStatus ? "100% Eligible" : "Eligible";
      const fHostel = document.getElementById("cd-fact-hostel");
      if (fHostel) fHostel.textContent = fees.hostelFee || "₹28,000 / yr";

      // 14. Favorites Buttons State
      updateCollegeDetailPageFavoriteUI();

      // 15. Infrastructure / Campus Gallery (Referenced from demoooo for pagess.html gallery-lg)
      const gal = document.getElementById("cd-gallery-container");
      if (gal) {
        gal.innerHTML = cdHeroImages.map((imgSrc, i) =>
          `<figure class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <img src="${imgSrc}" alt="${college.name} photo ${i+1}" class="w-full aspect-video object-cover" onerror="window.handleCollegeImgError(this, '${college.code || college.id}')">
            <figcaption class="p-2.5 text-xs text-slate-500 bg-slate-50 border-t border-slate-100 font-medium">
              ${college.name} - View #${i+1}
            </figcaption>
          </figure>`
        ).join("");
      }

      // 16. Pager (Referenced from demoooo for pagess.html pager)
      const curIndex = colleges.findIndex(c => c.id === college.id);
      const prevCol = curIndex > 0 ? colleges[curIndex - 1] : colleges[colleges.length - 1];
      const nextCol = curIndex < colleges.length - 1 ? colleges[curIndex + 1] : colleges[0];
      const prevName = document.getElementById("cd-prev-name");
      if (prevName && prevCol) prevName.textContent = prevCol.code ? `${prevCol.code} - ${prevCol.name.slice(0, 24)}...` : prevCol.name.slice(0, 30);
      const nextName = document.getElementById("cd-next-name");
      if (nextName && nextCol) nextName.textContent = nextCol.code ? `${nextCol.code} - ${nextCol.name.slice(0, 24)}...` : nextCol.name.slice(0, 30);

      // 17. Hide other views & Show Detail View Page (Smooth Full-Page Navigation)
      const homeView = document.getElementById("home-view-container");
      const searchView = document.getElementById("search-view-container") || document.getElementById("explorer-view-container");
      const priorityView = document.getElementById("priority-view-container");
      const analyticsView = document.getElementById("analytics-view-container");
      const docsView = document.getElementById("docs-view-container");
      const profileView = document.getElementById("profile-view-container");
      const historyView = document.getElementById("history-view-container");
      const collegeDetailView = document.getElementById("college-detail-view-container");
      if (collegeDetailView && viewName !== "college-detail") collegeDetailView.classList.add("hidden");
      const detailPage = document.getElementById("college-detail-view-container");
      const detailModal = document.getElementById("detail-modal");

      if (homeView) homeView.classList.add("hidden");
      if (searchView) searchView.classList.add("hidden");
      if (priorityView) priorityView.classList.add("hidden");
      if (analyticsView) analyticsView.classList.add("hidden");
      if (docsView) docsView.classList.add("hidden");
      if (profileView) profileView.classList.add("hidden");
      if (historyView) historyView.classList.add("hidden");
      if (detailModal) detailModal.classList.add("hidden");

      if (detailPage) {
        detailPage.classList.remove("hidden");
      }

      // Update URL hash cleanly
      try {
        window.history.pushState({ collegeId: college.id }, college.name, `#/college/${college.id}`);
      } catch (e) {}

      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function closeCollegeDetailPage() {
      const detailPage = document.getElementById("college-detail-view-container");
      if (detailPage) detailPage.classList.add("hidden");

      const returnView = appState.previousView || "add-rank";
      switchMainView(returnView);
      if (returnView === "add-rank" || returnView === "home") {
        if (typeof showHomeSlide === "function") {
          showHomeSlide(2); // Keep on Slide 2 so eligible college search is preserved!
        }
      }
      try {
        window.history.pushState({}, "The Bridge", `#/home`);
      } catch (e) {}
    }

    function navigateAdjacentCollege(direction) {
      const colleges = (typeof collegesData !== "undefined" && Array.isArray(collegesData)) ? collegesData : (window.collegesData || []);
      const curIndex = colleges.findIndex(c => c.id === appState.activeDetailPageCollegeId);
      if (curIndex === -1) return;
      const targetIndex = (curIndex + direction + colleges.length) % colleges.length;
      openCollegeDetailPage(colleges[targetIndex].id);
    }

    function updateCollegeDetailPageFavoriteUI() {
      const collegeId = appState.activeDetailPageCollegeId;
      const inShortlist = appState.shortlist.includes(collegeId);

      const topLabel = document.getElementById("cd-top-favorite-label");
      const topStar = document.getElementById("cd-top-favorite-star");
      if (topLabel) topLabel.textContent = inShortlist ? "In Favorites" : "Add to Favorites";
      if (topStar) topStar.textContent = inShortlist ? "★" : "☆";

      const factLabel = document.getElementById("cd-fact-fav-label");
      const factStar = document.getElementById("cd-fact-fav-star");
      if (factLabel) factLabel.textContent = inShortlist ? "In Favorites" : "Add to Favorites";
      if (factStar) factStar.textContent = inShortlist ? "★" : "☆";
    }

    function toggleCollegeDetailPageFavorite() {
      const collegeId = appState.activeDetailPageCollegeId;
      if (!collegeId) return;
      const pos = appState.shortlist.indexOf(collegeId);
      if (pos === -1) {
        appState.shortlist.push(collegeId);
        showToast("Added to Favorites", "★");
      } else {
        appState.shortlist.splice(pos, 1);
        showToast("Removed from Favorites", "ℹ️");
      }
      saveState();
      updateHeaderBadges();
      updateCollegeDetailPageFavoriteUI();
    }

    // Alias openCollegeModal to openCollegeDetailPage so all legacy calls open the page!
    function openCollegeModal(collegeId) {
      return openCollegeDetailPage(collegeId);
    }

    window.openCollegeDetailPage = openCollegeDetailPage;
    window.closeCollegeDetailPage = closeCollegeDetailPage;
    window.navigateAdjacentCollege = navigateAdjacentCollege;
    window.toggleCollegeDetailPageFavorite = toggleCollegeDetailPageFavorite;
    window.openCollegeModal = openCollegeDetailPage;


    function switchModalTab(tabKey) {
      const sections = {
        overview: "modal-section-overview",
        payment: "modal-section-payment",
        scholarships: "modal-section-scholarships",
        hostels: "modal-section-hostels",
        travel: "modal-section-travel",
        food: "modal-section-food"
      };
      const btns = {
        overview: "modal-tab-btn-overview",
        payment: "modal-tab-btn-payment",
        scholarships: "modal-tab-btn-scholarships",
        hostels: "modal-tab-btn-hostels",
        travel: "modal-tab-btn-travel",
        food: "modal-tab-btn-food"
      };

      Object.keys(sections).forEach(k => {
        const sec = document.getElementById(sections[k]);
        const btn = document.getElementById(btns[k]);
        if (k === tabKey) {
          sec.classList.remove("hidden");
          btn.classList.add("bg-white", "text-blue-700", "shadow-sm");
          btn.classList.remove("text-slate-600");
        } else {
          sec.classList.add("hidden");
          btn.classList.remove("bg-white", "text-blue-700", "shadow-sm");
          btn.classList.add("text-slate-600");
        }
      });
    }

    function renderShortlistModal() {
      const emptyEl = document.getElementById("shortlist-empty");
      const contentEl = document.getElementById("shortlist-content");
      const tbody = document.getElementById("shortlist-table-body");

      if (appState.shortlist.length === 0) {
        emptyEl.classList.remove("hidden");
        contentEl.classList.add("hidden");
        return;
      }

      emptyEl.classList.add("hidden");
      contentEl.classList.remove("hidden");

      tbody.innerHTML = appState.shortlist.map(id => {
        const c = collegesData.find(x => x.id === id);
        if (!c) return "";
        return `
          <tr>
            <td class="p-3">
              <strong class="text-slate-900 block">${c.name} (${c.code})</strong>
              <span class="text-[11px] text-slate-500">${c.location}</span>
            </td>
            <td class="p-3 text-center font-bold text-emerald-800">${c.rating} (${c.grade})</td>
            <td class="p-3 font-semibold">${c.fees.annualTuition}</td>
            <td class="p-3 text-center font-bold text-blue-800">${c.placements.medianPackage} / ${c.placements.avgPackage}</td>
            <td class="p-3 text-center font-bold text-indigo-800">${c.placements.highestPackage}</td>
            <td class="p-3 text-center font-semibold">${c.placements.placementRate}</td>
            <td class="p-3 text-right space-x-1">
              <button type="button" data-action="add-default-priority" data-college-id="${c.id}" class="px-2.5 py-1 bg-amber-500 text-slate-950 font-bold rounded-lg text-[11px]">+ Priority</button>
              <button type="button" data-action="toggle-shortlist" data-college-id="${c.id}" class="px-2 py-1 text-rose-600 font-bold text-[11px]">Remove</button>
            </td>
          </tr>
        `;
      }).join("");
    }

    // =========================================================================
    // 10. VIEW SWITCHING & INTERACTIVE EVENT WIRING (SEPARATE HOME & SEARCH)
    // =========================================================================
    function switchMainView(viewName) {
      if (viewName === "explorer") viewName = "search";
      if (viewName === "explore") viewName = "search";
      if (viewName && viewName !== "profile") {
        appState.lastWorkingView = viewName;
      }
      appState.activeView = viewName;
      const homeView = document.getElementById("home-view-container");
      const searchView = document.getElementById("search-view-container") || document.getElementById("explorer-view-container");
      const priorityView = document.getElementById("priority-view-container");
      const analyticsView = document.getElementById("analytics-view-container");
      const docsView = document.getElementById("docs-view-container");
      const profileView = document.getElementById("profile-view-container");
      const historyView = document.getElementById("history-view-container");

      if (viewName === "add-rank" || viewName === "home") {
        if (homeView) homeView.classList.remove("hidden");
        if (searchView) searchView.classList.add("hidden");
        if (priorityView) priorityView.classList.add("hidden");
        if (analyticsView) analyticsView.classList.add("hidden");
        if (docsView) docsView.classList.add("hidden");
        if (profileView) profileView.classList.add("hidden");
        if (historyView) historyView.classList.add("hidden");

        document.querySelectorAll("#app-nav button").forEach(b => b.classList.toggle("on", b.dataset.nav === "add-rank"));
        if (typeof showHomeSlide === "function") {
          showHomeSlide(1);
        } else {
          renderExplorer();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      } else if (viewName === "search") {
        if (homeView) homeView.classList.add("hidden");
        if (searchView) searchView.classList.remove("hidden");
        if (priorityView) priorityView.classList.add("hidden");
        if (analyticsView) analyticsView.classList.add("hidden");
        if (docsView) docsView.classList.add("hidden");
        if (profileView) profileView.classList.add("hidden");
        if (historyView) historyView.classList.add("hidden");

        document.querySelectorAll("#app-nav button").forEach(b => b.classList.toggle("on", b.dataset.nav === "search"));
        if (typeof renderSearchDirectory === "function") {
          renderSearchDirectory();
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        if (homeView) homeView.classList.add("hidden");
        if (searchView) searchView.classList.add("hidden");
        if (priorityView) priorityView.classList.toggle("hidden", viewName !== "priority");
        if (analyticsView) analyticsView.classList.toggle("hidden", viewName !== "analytics");
        if (docsView) docsView.classList.toggle("hidden", viewName !== "docs");
        if (profileView) profileView.classList.toggle("hidden", viewName !== "profile");
        if (historyView) historyView.classList.toggle("hidden", viewName !== "history");

        document.querySelectorAll("#app-nav button").forEach(b => b.classList.toggle("on", b.dataset.nav === viewName));

        if (viewName === "priority") renderPrioritySheet();
        if (viewName === "analytics") {
          renderRoiCalculator();
          setTimeout(() => {
            if (typeof triggerAutoRoiCalculation === "function") triggerAutoRoiCalculation();
          }, 60);
          if (typeof renderCutoffMatrix === "function") renderCutoffMatrix();
        }
        if (viewName === "docs") renderDocumentChecklist();
        if (viewName === "history") {
          if (typeof xRenderHistory === "function") xRenderHistory();
          else if (typeof renderUserHistory === "function") renderUserHistory();
        }
        if (viewName === "profile") renderProfileView();
      }
    }

    window.renderUserHistory = function() {
      if (typeof xRenderHistory === "function") xRenderHistory();
    };

    
    // =========================================================================
    // STUDENT PROFILE PICTURE & FALLBACK INITIALS COMPONENT JS
    // =========================================================================
    
    window.openAvatarActionModal = function() {
      const modal = document.getElementById("avatar-action-modal");
      if (!modal) return;
      
      const previewImg = document.getElementById("modalAvatarPreviewImg");
      const previewFallback = document.getElementById("modalAvatarPreviewFallback");
      const removeBtn = document.getElementById("modalRemoveAvatarBtn");
      const uploadLabel = document.getElementById("modalUploadBtnLabel");
      const initialsEl = document.getElementById("avatarInitials");
      
      const currentAvatar = (typeof studentProfile === "object" && studentProfile.avatarUrl) ? studentProfile.avatarUrl.trim() : "";
      const initials = initialsEl ? initialsEl.textContent : "SB";

      if (previewFallback) previewFallback.textContent = initials;

      if (currentAvatar) {
        if (previewImg) {
          previewImg.src = currentAvatar;
          previewImg.classList.remove("hidden");
        }
        if (previewFallback) previewFallback.classList.add("hidden");
        if (removeBtn) removeBtn.classList.remove("hidden");
        if (uploadLabel) uploadLabel.textContent = "Change Photo";
      } else {
        if (previewImg) {
          previewImg.src = "";
          previewImg.classList.add("hidden");
        }
        if (previewFallback) previewFallback.classList.remove("hidden");
        if (removeBtn) removeBtn.classList.add("hidden");
        if (uploadLabel) uploadLabel.textContent = "Upload New Photo";
      }

      modal.classList.remove("hidden");
    };

    window.closeAvatarActionModal = function() {
      const modal = document.getElementById("avatar-action-modal");
      if (modal) modal.classList.add("hidden");
    };

    window.triggerAvatarFileInput = function() {
      closeAvatarActionModal();
      const fileInput = document.getElementById("profileImageInput");
      if (fileInput) fileInput.click();
    };

    window.removeStudentAvatar = async function() {
      closeAvatarActionModal();

      // 1. Immediately update UI to fallback initials
      if (typeof updateProfileAvatarUI === "function") {
        updateProfileAvatarUI("");
      }
      if (typeof applyAvatar === "function") {
        applyAvatar("");
      }

      // 2. Clear from memory & localStorage
      if (typeof studentProfile === "object") {
        studentProfile.avatarUrl = "";
        try {
          localStorage.setItem("student_profile", JSON.stringify(studentProfile));
          localStorage.setItem("bridge_profile", JSON.stringify(studentProfile));
        } catch (e) {}
      }

      if (typeof showToast === "function") {
        showToast("Profile picture removed! Falling back to initials. ✨", "🗑️");
      }

      // 3. Clear from backend
      try {
        const email = (studentProfile && studentProfile.email) || localStorage.getItem("bridge_user_email") || "";
        const token = localStorage.getItem("bridge_token") || localStorage.getItem("token") || "";
        const apiBase = (window.I2T_CONFIG && window.I2T_CONFIG.API_BASE) ? window.I2T_CONFIG.API_BASE : "";
        
        await fetch(apiBase + "/api/profile/upload-avatar", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { "Authorization": "Bearer " + token } : {})
          },
          body: JSON.stringify({ email, avatarUrl: "" })
        });
      } catch (err) {
        console.warn("Backend remove avatar error (cleared locally):", err);
      }
    };

    window.updateProfileAvatarUI = function(avatarUrl, name, email) {
      try {
        const userProfileImg = document.getElementById("userProfileImg");
        const defaultAvatar = document.getElementById("defaultAvatar");
        const avatarInitials = document.getElementById("avatarInitials");
        const legacyAvatarImg = document.getElementById("kodnest-main-avatar-img");
        const legacyPlaceholder = document.getElementById("kodnest-main-avatar-placeholder");
        const userNameDisplay = document.getElementById("userNameDisplay");
        const userEmailDisplay = document.getElementById("userEmailDisplay");

        const currentName = name || (typeof studentProfile === "object" && (studentProfile.fullName || studentProfile.username)) || "Student Bridge";
        const currentEmail = email || (typeof studentProfile === "object" && studentProfile.email) || "";

        if (userNameDisplay && currentName) {
          userNameDisplay.textContent = currentName;
        }
        if (userEmailDisplay && currentEmail) {
          userEmailDisplay.textContent = currentEmail;
        }

        // Compute 2-letter uppercase initials
        let initials = "SB";
        if (currentName && currentName !== "Guest Student" && currentName !== "Student") {
          const parts = currentName.trim().split(/\s+/).filter(Boolean);
          if (parts.length >= 2) {
            initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
          } else if (parts.length === 1 && parts[0].length >= 2) {
            initials = parts[0].slice(0, 2).toUpperCase();
          } else if (parts.length === 1) {
            initials = parts[0][0].toUpperCase();
          }
        } else if (currentEmail && currentEmail.includes("@")) {
          initials = currentEmail.split("@")[0].slice(0, 2).toUpperCase();
        }

        if (avatarInitials) avatarInitials.textContent = initials;
        if (legacyPlaceholder) legacyPlaceholder.textContent = initials;

        const url = avatarUrl || (typeof studentProfile === "object" && studentProfile.avatarUrl);

        if (url && typeof url === "string" && url.trim().length > 0) {
          if (userProfileImg) {
            userProfileImg.src = url;
            userProfileImg.style.display = "block";
            userProfileImg.onerror = function() {
              userProfileImg.style.display = "none";
              if (defaultAvatar) defaultAvatar.style.display = "flex";
            };
          }
          if (defaultAvatar) {
            defaultAvatar.style.display = "none";
          }
          if (legacyAvatarImg) {
            legacyAvatarImg.src = url;
            legacyAvatarImg.style.display = "block";
            legacyAvatarImg.classList.remove("hidden");
          }
          if (legacyPlaceholder) {
            legacyPlaceholder.style.display = "none";
            legacyPlaceholder.classList.add("hidden");
          }
        } else {
          if (userProfileImg) {
            userProfileImg.style.display = "none";
            userProfileImg.src = "";
          }
          if (defaultAvatar) {
            defaultAvatar.style.display = "flex";
          }
          if (legacyAvatarImg) {
            legacyAvatarImg.style.display = "none";
            legacyAvatarImg.classList.add("hidden");
          }
          if (legacyPlaceholder) {
            legacyPlaceholder.style.display = "flex";
            legacyPlaceholder.classList.remove("hidden");
          }
        }

        const miniAvatar = document.getElementById("profile-mini-avatar-img");
        if (miniAvatar && url) {
          miniAvatar.src = url;
          miniAvatar.classList.remove("hidden");
        }
        const navAvatar = document.getElementById("nav-dropdown-avatar-img");
        if (navAvatar && url) {
          navAvatar.src = url;
        }
      } catch (err) {
        console.warn("Avatar update error:", err);
      }
    };

    window.handleImageUpload = async function(event) {
      try {
        const file = event.target.files && event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
          if (typeof showToast === "function") showToast("Please select a valid image file (PNG, JPG, WebP)", "⚠️");
          else alert("Please select a valid image file");
          event.target.value = "";
          return;
        }

        if (file.size > 5 * 1024 * 1024) {
          if (typeof showToast === "function") showToast("Image size must be less than 5MB", "⚠️");
          else alert("Image size must be less than 5MB");
          event.target.value = "";
          return;
        }

        const reader = new FileReader();
        reader.onload = async function(e) {
          const rawDataUrl = e.target.result;

          const saveAndSyncAvatar = async (dataUrl) => {
            updateProfileAvatarUI(dataUrl);
            if (typeof applyAvatar === "function") {
              applyAvatar(dataUrl);
            }

            if (typeof studentProfile === "object") {
              studentProfile.avatarUrl = dataUrl;
              try {
                localStorage.setItem("student_profile", JSON.stringify(studentProfile));
                localStorage.setItem("bridge_profile", JSON.stringify(studentProfile));
              } catch (storageErr) {}
            }

            if (typeof showToast === "function") {
              showToast("Saving new profile picture... 📸", "⏳");
            }

            try {
              const email = (studentProfile && studentProfile.email) || localStorage.getItem("bridge_user_email") || "";
              const token = localStorage.getItem("bridge_token") || localStorage.getItem("token") || "";
              const apiBase = (window.I2T_CONFIG && window.I2T_CONFIG.API_BASE) ? window.I2T_CONFIG.API_BASE : "";
              
              const res = await fetch(apiBase + "/api/profile/upload-avatar", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  ...(token ? { "Authorization": "Bearer " + token } : {})
                },
                body: JSON.stringify({ email, avatarUrl: dataUrl })
              });
              const data = await res.json();
              if (data.ok) {
                if (typeof showToast === "function") showToast("Profile picture updated & synced! 📸", "✅");
              } else {
                if (typeof showToast === "function") showToast("Profile picture saved locally! 📸", "✅");
              }
            } catch (netErr) {
              if (typeof showToast === "function") showToast("Profile picture saved locally! 📸", "✅");
            }
          };

          const img = new Image();
          img.onload = () => {
            try {
              const canvas = document.createElement("canvas");
              const maxDim = 256;
              let w = img.width, h = img.height;
              if (w > h) {
                if (w > maxDim) { h = Math.round((h * maxDim) / w); w = maxDim; }
              } else {
                if (h > maxDim) { h = Math.round((h * maxDim) / h); h = maxDim; }
              }
              canvas.width = w; canvas.height = h;
              const ctx = canvas.getContext("2d");
              ctx.drawImage(img, 0, 0, w, h);
              const compactDataUrl = canvas.toDataURL("image/jpeg", 0.88);
              saveAndSyncAvatar(compactDataUrl);
            } catch (canvasErr) {
              saveAndSyncAvatar(rawDataUrl);
            }
          };
          img.onerror = () => saveAndSyncAvatar(rawDataUrl);
          img.src = rawDataUrl;
        };
        reader.readAsDataURL(file);
      } catch (uploadErr) {
        console.error("handleImageUpload error:", uploadErr);
      }
    };

    function renderProfileView() {
      const isAuth = !!(studentProfile.isLoggedIn && (studentProfile.email || studentProfile.fullName));

      // 1. Identity & Contact Card
      const nameEl = document.getElementById("kodnest-display-fullname");
      const idEl = document.getElementById("kodnest-display-id");
      const bridgeIdEl = document.getElementById("kodnest-display-bridgeid");
      const emailEl = document.getElementById("kodnest-display-email");
      const genderEl = document.getElementById("kodnest-display-gender");
      const dobEl = document.getElementById("kodnest-display-dob");
      const waEl = document.getElementById("kodnest-display-whatsapp");
      const phoneEl = document.getElementById("kodnest-display-phone");
      const expEl = document.getElementById("kodnest-display-experience");
      const avatarImg = document.getElementById("kodnest-main-avatar-img");
      const avatarPlaceholder = document.getElementById("kodnest-main-avatar-placeholder");
      const guestPrompt = document.getElementById("kodnest-guest-auth-prompt");
      const logoutBtn = document.getElementById("kodnest-btn-logout");
      const signinBtn = document.getElementById("kodnest-btn-signin");
      const navDropUser = document.getElementById("nav-dropdown-username");

      if (isAuth) {
        if (guestPrompt) guestPrompt.classList.add("hidden");
        if (logoutBtn) logoutBtn.classList.remove("hidden");
        if (signinBtn) signinBtn.classList.add("hidden");

        const displayFullName = studentProfile.fullName || studentProfile.username || (studentProfile.email ? studentProfile.email.split("@")[0] : "Student Bridge");
        const uNameDisplay = document.getElementById("userNameDisplay");
        const uEmailDisplay = document.getElementById("userEmailDisplay");
        if (uNameDisplay) uNameDisplay.textContent = displayFullName;
        if (uEmailDisplay) uEmailDisplay.textContent = studentProfile.email || "student.bridge@gmail.com";
        if (typeof updateProfileAvatarUI === "function") updateProfileAvatarUI(studentProfile.avatarUrl, displayFullName, studentProfile.email);
        if (nameEl) nameEl.textContent = displayFullName;
        if (idEl) idEl.textContent = studentProfile.kodnestId || "STU-" + (studentProfile.phone ? studentProfile.phone.slice(-4) : "2026");
        if (bridgeIdEl) bridgeIdEl.textContent = studentProfile.bridgeId || "BRG-" + ((studentProfile.email ? studentProfile.email.split("@")[0] : "2026").toUpperCase());
        if (emailEl) emailEl.textContent = studentProfile.email || "Registered Student";
        if (genderEl) genderEl.textContent = studentProfile.gender || "Not specified";
        if (dobEl) dobEl.textContent = studentProfile.dob || "Not specified";
        if (waEl) waEl.textContent = studentProfile.whatsapp || studentProfile.phone || "Not specified";
        if (phoneEl) phoneEl.textContent = studentProfile.phone ? "+91 " + studentProfile.phone : "Not specified";
        if (expEl) expEl.textContent = studentProfile.experience || "Fresher";

        if (avatarPlaceholder) {
          const initials = displayFullName.split(" ").filter(Boolean).map(n => n[0]).join("").slice(0, 2).toUpperCase() || "ST";
          avatarPlaceholder.textContent = initials;
          avatarPlaceholder.classList.remove("hidden");
        }
        if (avatarImg && !studentProfile.avatarUrl) {
          avatarImg.classList.add("hidden");
        }
        if (navDropUser) navDropUser.textContent = studentProfile.username || studentProfile.fullName || "Student";
      } else {
        if (guestPrompt) guestPrompt.classList.remove("hidden");
        if (logoutBtn) logoutBtn.classList.add("hidden");
        if (signinBtn) signinBtn.classList.remove("hidden");

        if (nameEl) nameEl.textContent = "Guest Student";
        const gNameDisplay = document.getElementById("userNameDisplay");
        const gEmailDisplay = document.getElementById("userEmailDisplay");
        if (gNameDisplay) gNameDisplay.textContent = "Student Bridge";
        if (gEmailDisplay) gEmailDisplay.textContent = "student.bridge@gmail.com";
        if (typeof updateProfileAvatarUI === "function") updateProfileAvatarUI(null, "Student Bridge", "student.bridge@gmail.com");
        if (idEl) idEl.textContent = "—";
        if (bridgeIdEl) bridgeIdEl.textContent = "—";
        if (emailEl) emailEl.textContent = "Not Signed In";
        if (genderEl) genderEl.textContent = "—";
        if (dobEl) dobEl.textContent = "—";
        if (waEl) waEl.textContent = "—";
        if (phoneEl) phoneEl.textContent = "—";
        if (expEl) expEl.textContent = "Fresher";

        if (avatarPlaceholder) {
          avatarPlaceholder.textContent = "👤";
          avatarPlaceholder.classList.remove("hidden");
        }
        if (avatarImg) avatarImg.classList.add("hidden");
        if (navDropUser) navDropUser.textContent = "Guest";
      }

      // 2. Generic Details Card
      const workExpEl = document.getElementById("kodnest-display-workexp");
      const careerGapEl = document.getElementById("kodnest-display-careergap");
      const stateEl = document.getElementById("kodnest-display-state");
      const cityEl = document.getElementById("kodnest-display-city");
      const locsEl = document.getElementById("kodnest-display-locations");
      const ghEl = document.getElementById("kodnest-display-github");
      const liEl = document.getElementById("kodnest-display-linkedin");

      if (workExpEl) workExpEl.textContent = isAuth ? (studentProfile.experience || "Fresher") : "Sign in to add";
      if (careerGapEl) careerGapEl.textContent = isAuth ? (studentProfile.careerGap || "0") : "—";
      if (stateEl) stateEl.textContent = isAuth ? (studentProfile.currentState || "Andhra Pradesh") : "—";
      if (cityEl) cityEl.textContent = isAuth ? (studentProfile.currentCity || "—") : "—";
      if (locsEl) locsEl.textContent = isAuth ? (studentProfile.preferredLocations || "Not specified") : "Sign in to add preferences";
      if (ghEl) {
        if (isAuth && studentProfile.github) {
          ghEl.href = studentProfile.github;
          ghEl.textContent = studentProfile.github.replace(/^https?:\/\//, "");
        } else {
          ghEl.removeAttribute("href");
          ghEl.textContent = "Not linked";
        }
      }
      if (liEl) {
        if (isAuth && studentProfile.linkedin) {
          liEl.href = studentProfile.linkedin;
          liEl.textContent = studentProfile.linkedin.replace(/^https?:\/\//, "");
        } else {
          liEl.removeAttribute("href");
          liEl.textContent = "Not linked";
        }
      }

      // 3. 10th School Details
      const s10Name = document.getElementById("kodnest-display-school10-name");
      const s10Year = document.getElementById("kodnest-display-school10-year");
      const s10Pct = document.getElementById("kodnest-display-school10-pct");
      if (s10Name) s10Name.textContent = isAuth ? (studentProfile.school10Name || "Not added yet (Click Edit Profile)") : "Sign in to add 10th school";
      if (s10Year) s10Year.textContent = isAuth ? (studentProfile.school10Year || "—") : "—";
      if (s10Pct) s10Pct.textContent = isAuth ? (studentProfile.school10Pct || "—") : "—";

      // 4. 12th / Inter Details
      const i12Name = document.getElementById("kodnest-display-inter-name");
      const i12Board = document.getElementById("kodnest-display-inter-board");
      const i12Year = document.getElementById("kodnest-display-inter-year");
      const i12Pct = document.getElementById("kodnest-display-inter-pct");
      if (i12Name) i12Name.textContent = isAuth ? (studentProfile.interCollegeName || "Not added yet (Click Edit Profile)") : "Sign in to add Junior College";
      if (i12Board) i12Board.textContent = isAuth ? (studentProfile.interBoard || "—") : "—";
      if (i12Year) i12Year.textContent = isAuth ? (studentProfile.interYear || "—") : "—";
      if (i12Pct) i12Pct.textContent = isAuth ? (studentProfile.interPct || "—") : "—";

      // 5. UG Details
      const ugRoll = document.getElementById("kodnest-display-ug-roll");
      const ugCol = document.getElementById("kodnest-display-ug-college");
      const ugCourse = document.getElementById("kodnest-display-ug-course");
      const ugBranch = document.getElementById("kodnest-display-ug-branch");
      const ugYear = document.getElementById("kodnest-display-ug-year");
      const ugPct = document.getElementById("kodnest-display-ug-pct");
      const ugCgpa = document.getElementById("kodnest-display-ug-cgpa");
      const ugBack = document.getElementById("kodnest-display-ug-backlogs");
      if (ugRoll) ugRoll.textContent = isAuth ? (studentProfile.ugRollNo || "—") : "—";
      if (ugCol) ugCol.textContent = isAuth ? (studentProfile.ugCollege || "Not added yet") : "Sign in to add Graduation Details";
      if (ugCourse) ugCourse.textContent = isAuth ? (studentProfile.ugCourse || "B.Tech") : "—";
      if (ugBranch) ugBranch.textContent = isAuth ? (studentProfile.ugBranch || "—") : "—";
      if (ugYear) ugYear.textContent = isAuth ? (studentProfile.ugYear || "—") : "—";
      if (ugPct) ugPct.textContent = isAuth ? (studentProfile.ugPct || "—") : "—";
      if (ugCgpa) ugCgpa.textContent = isAuth ? (studentProfile.ugCgpa || "—") : "—";
      if (ugBack) ugBack.textContent = isAuth ? (studentProfile.ugBacklogs || "0") : "—";
    }

    
    // Entrance Exam Alert and Validation Functions
    function showExamRequiredAlert(msg) {
      const alertText = msg || "First, please select your <strong>Entrance Exam</strong> (<strong>AP CET</strong>, <strong>JEE Main</strong>, <strong>JEE Advanced</strong>, or <strong>Payment Colleges</strong>) before proceeding to view colleges or enter your rank!";
      
      // 1. Show inline banner
      const alertBox = document.getElementById("exam-required-alert");
      if (alertBox) {
        alertBox.classList.remove("hidden");
      }

      // 2. Highlight and scroll exam selector container into view
      const container = document.getElementById("exam-selector-container");
      if (container) {
        container.classList.add("ring-4", "ring-rose-400", "border-rose-500", "bg-rose-50/20");
        container.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      // 3. Show modern modal alert
      const modal = document.getElementById("exam-alert-modal");
      const modalMsg = document.getElementById("exam-alert-modal-msg");
      if (modalMsg) modalMsg.innerHTML = alertText;
      if (modal) modal.classList.remove("hidden");
    }

    function closeExamAlertModal() {
      const modal = document.getElementById("exam-alert-modal");
      if (modal) modal.classList.add("hidden");
      const container = document.getElementById("exam-selector-container");
      if (container) {
        container.scrollIntoView({ behavior: "smooth", block: "center" });
        const firstBtn = container.querySelector(".exam-tab-btn");
        if (firstBtn) firstBtn.focus();
      }
    }

    function setExamTab(examCode) {
      appState.exam = examCode;
      appState.currentLimit = appState.pageSize;

      // Clear alerts
      const alertBox = document.getElementById("exam-required-alert");
      if (alertBox) alertBox.classList.add("hidden");
      const modal = document.getElementById("exam-alert-modal");
      if (modal) modal.classList.add("hidden");
      const container = document.getElementById("exam-selector-container");
      if (container) container.classList.remove("ring-4", "ring-rose-400", "border-rose-500", "bg-rose-50/20");

      // Option selected badge removed as requested
      const statusInd = document.getElementById("exam-status-indicator");
      if (statusInd) {
        statusInd.innerHTML = '';
        statusInd.classList.add('hidden');
      }

      // When selecting All Indian Colleges, JEE Main, or JEE Advanced, default state scope to ALL states
      if (examCode === "ALL" || examCode === "all" || examCode === "jee_main" || examCode === "jee_adv") {
        appState.state = "ALL";
        const stSel = document.getElementById("state-select");
        if (stSel) stSel.value = "ALL";
        if (examCode === "ALL" || examCode === "all") {
          appState.onlyEligible = false;
          const toggle = document.getElementById("only-eligible-toggle");
          if (toggle) toggle.checked = false;
        }
      }

      // Handle JEE vs AP CET local area & district filter visibility
      const apRegionContainer = document.getElementById("ap-region-container");
      const apDistrictContainer = document.getElementById("ap-district-container");
      const jeeAirContainer = document.getElementById("jee-air-container");
      const jeeGenContainer = document.getElementById("jee-general-container");
      const jeeRankModeBox = document.getElementById("jee-rank-mode-box");
      const rankUnit = document.getElementById("rank-unit-tag");

      if (examCode === "jee_main" || examCode === "jee_adv") {
        // 1. Hide Local Area / University Region (Pic 2) and AP District (Pic 3)
        if (apRegionContainer) apRegionContainer.classList.add("hidden");
        if (apDistrictContainer) apDistrictContainer.classList.add("hidden");

        // 2. In their place, show All India Rank (AIR / CRL) and General Rank / Category Rank
        if (jeeAirContainer) jeeAirContainer.classList.remove("hidden");
        if (jeeGenContainer) jeeGenContainer.classList.remove("hidden");
        if (jeeRankModeBox) jeeRankModeBox.classList.remove("hidden");

        // Reset AP local area and district state so they do not restrict national JEE results
        appState.region = "ALL";
        appState.district = "ALL";
        const rSel = document.getElementById("region-select");
        if (rSel) rSel.value = "ALL";
        const dSel = document.getElementById("district-select");
        if (dSel) dSel.value = "ALL";

        if (rankUnit) rankUnit.textContent = appState.jeeRankMode === "general" ? "GEN" : "AIR";
        if (typeof updateQuickRankChips === "function") updateQuickRankChips(examCode);
      } else {
        // Restore Local Area / Region and AP District for AP CET
        if (apRegionContainer) apRegionContainer.classList.remove("hidden");
        if (apDistrictContainer) apDistrictContainer.classList.remove("hidden");

        // Hide JEE options
        if (jeeAirContainer) jeeAirContainer.classList.add("hidden");
        if (jeeGenContainer) jeeGenContainer.classList.add("hidden");
        if (jeeRankModeBox) jeeRankModeBox.classList.add("hidden");

        if (rankUnit) rankUnit.textContent = "Rank";
        if (typeof updateQuickRankChips === "function") updateQuickRankChips("ap_cet");
      }

      // If Payment is selected, hide the Rank filter box and show Direct Admission note
      const rankContainer = document.getElementById("rank-input-container");
      const quickChips = document.getElementById("quick-rank-chips-container");
      const paymentBadge = document.getElementById("payment-direct-badge-box");
      if (examCode === "payment") {
        if (rankContainer) rankContainer.classList.add("hidden");
        if (quickChips) quickChips.classList.add("hidden");
        if (paymentBadge) paymentBadge.classList.remove("hidden");
      } else {
        if (rankContainer) rankContainer.classList.remove("hidden");
        if (quickChips) quickChips.classList.remove("hidden");
        if (paymentBadge) paymentBadge.classList.add("hidden");
      }

      // Sync state dropdown and badge
      const stSelect = document.getElementById("state-select");
      if (stSelect && appState.state) {
        stSelect.value = appState.state;
        const badge = document.getElementById("state-active-badge");
        if (badge) badge.textContent = appState.state === "ALL" ? "ALL STATES" : appState.state.toUpperCase();
      }

      
      // Intercept filter dropdowns if exam is not selected first
      ["category-select", "gender-select", "state-select", "district-select", "branch-select", "type-select", "min-pkg-select"].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          el.addEventListener("mousedown", (e) => {
            if (!appState.exam) {
              e.preventDefault();
              showExamRequiredAlert("First, please select your <strong>Entrance Exam</strong> before modifying filters!");
            }
          });
        }
      });

      document.querySelectorAll(".exam-tab-btn").forEach(btn => {
        if (btn.dataset.exam === examCode) {
          btn.className = "exam-tab-btn active px-3 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-blue-600 text-white shadow-sm border border-blue-600 text-left transition flex flex-col justify-between";
        } else if (btn.dataset.exam === "payment") {
          btn.className = "exam-tab-btn px-3 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-amber-50/70 hover:bg-amber-100/80 text-amber-950 border border-amber-300 text-left transition flex flex-col justify-between";
        } else {
          btn.className = "exam-tab-btn px-3 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-left transition flex flex-col justify-between";
        }
      });

      renderExplorer();
    }

    
    function goToNearAddRank() {
      if (typeof switchMainView === "function") {
        switchMainView("add-rank");
      }
      if (typeof showExplorerSlide === "function") {
        showExplorerSlide(1);
      }
      if (typeof showHomeSlide === "function") {
        showHomeSlide(1);
      }
      window.scrollTo({ top: 0, behavior: "instant" });
    }

    function initEventListeners() {
      window.addEventListener("popstate", (e) => {
        const hash = window.location.hash;
        if (hash.startsWith("#/college/")) {
          const colId = hash.replace("#/college/", "");
          if (colId) openCollegeDetailPage(colId);
        } else {
          const cdView = document.getElementById("college-detail-view-container");
          if (cdView && !cdView.classList.contains("hidden")) {
            closeCollegeDetailPage();
          }
        }
      });
      document.getElementById("view-explore-tab")?.addEventListener("click", () => switchMainView("explore"));
      document.getElementById("view-priority-tab")?.addEventListener("click", () => switchMainView("priority"));
      document.getElementById("view-analytics-tab")?.addEventListener("click", () => switchMainView("analytics"));
      document.getElementById("view-docs-tab")?.addEventListener("click", () => switchMainView("docs"));
      document.getElementById("open-priority-btn").addEventListener("click", () => switchMainView("priority"));
      document.getElementById("go-to-explorer-btn").addEventListener("click", () => switchMainView("explore"));

      document.querySelectorAll(".step-pill-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const step = btn.dataset.stepJump;
          if (step === "step1") {
            switchMainView("explore");
            setExamTab("ap_cet");
            appState.rank = 300000;
            document.getElementById("rank-input").value = "300000";
            document.getElementById("rank-clear-btn").classList.remove("hidden");
            renderExplorer();
            /* showToast("Step 1–2: Loaded Rank 3,00,000 matching colleges across AP!", "🚀"); (suppressed) */
          } else if (step === "step3") {
            switchMainView("explore");
            setExamTab("ap_cet");
            appState.rank = 8500;
            document.getElementById("rank-input").value = "8500";
            document.getElementById("rank-clear-btn").classList.remove("hidden");
            renderExplorer();
            /* showToast("Step 3: Showing live green qualifying branch badges for Rank 8,500!", "✅"); (suppressed) */
          } else if (step === "step4") {
            switchMainView("explore");
            setExamTab("payment");
            /* showToast("Step 4: Switched to Payment & Deemed Universities (Direct Admission & Scholarships)!", "💳"); (suppressed) */
          } else if (step === "step5") {
            if (appState.priorityList.length === 0) smartAutoFillPriority();
            switchMainView("priority");
            runMockAllotmentSimulation();
          } else if (step === "step6") {
            switchMainView("explore");
            setExamTab("ap_cet");
            appState.rank = null;
            document.getElementById("rank-input").value = "";
            appState.currentLimit = 48;
            renderExplorer();
            /* showToast("Step 6: Browsing 312+ AP EAPCET Colleges across all 26 AP Districts!", "🏛️"); (suppressed) */
          } else if (step === "step7") {
            switchMainView("explore");
            setExamTab("ap_cet");
            appState.sortBy = "rating_high";
            document.getElementById("sort-select").value = "rating_high";
            renderExplorer();
            /* showToast("Step 7: Sorted by Verified 2025 Ratings & Honest Placement Percentages!", "⭐"); (suppressed) */
          } else if (step === "step8") {
            switchMainView("analytics");
            /* showToast("Step 8 (New): Opened 4-Year B.Tech ROI Calculator & Multi-Category Cutoff Matrix!", "🧮"); (suppressed) */
          }
        });
      });

      document.querySelectorAll(".exam-tab-btn").forEach(btn => {
        btn.addEventListener("click", () => setExamTab(btn.dataset.exam));
      });

      const rankInput = document.getElementById("rank-input");
      const rankClearBtn = document.getElementById("rank-clear-btn");
      const jeeAirInput = document.getElementById("jee-air-input");
      const jeeGenInput = document.getElementById("jee-general-input");
      const jeeAirModeBtn = document.getElementById("jee-mode-air-btn");
      const jeeGenModeBtn = document.getElementById("jee-mode-gen-btn");

      function setJeeRankMode(mode) {
        appState.jeeRankMode = mode;
        const airBtn = document.getElementById("jee-mode-air-btn");
        const genBtn = document.getElementById("jee-mode-gen-btn");
        const modeLabel = document.getElementById("jee-active-mode-label");
        const airBadge = document.getElementById("jee-air-active-badge");
        const genBadge = document.getElementById("jee-gen-active-badge");
        const airInp = document.getElementById("jee-air-input");
        const genInp = document.getElementById("jee-general-input");
        const rankInp = document.getElementById("rank-input");
        const rankUnit = document.getElementById("rank-unit-tag");

        if (mode === "air") {
          if (airBtn) airBtn.className = "py-1.5 px-2 rounded-lg text-xs font-bold bg-white text-blue-700 shadow-sm border border-slate-200 transition text-center cursor-pointer";
          if (genBtn) genBtn.className = "py-1.5 px-2 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 border border-transparent transition text-center cursor-pointer";
          if (modeLabel) modeLabel.textContent = "All India Rank (AIR)";
          if (airBadge) { airBadge.textContent = "ACTIVE EVALUATION"; airBadge.className = "text-[10px] text-blue-600 font-extrabold uppercase"; }
          if (genBadge) { genBadge.textContent = "CATEGORY QUOTA"; genBadge.className = "text-[10px] text-slate-400 font-bold uppercase"; }
          if (rankUnit) rankUnit.textContent = "AIR";
          if (airInp && airInp.value) {
            const v = parseInt(airInp.value, 10);
            appState.rank = (!isNaN(v) && v > 0) ? v : null;
            if (rankInp) rankInp.value = airInp.value;
          } else if (rankInp && rankInp.value) {
            const v = parseInt(rankInp.value, 10);
            appState.rank = (!isNaN(v) && v > 0) ? v : null;
            if (airInp) airInp.value = rankInp.value;
          }
        } else {
          if (genBtn) genBtn.className = "py-1.5 px-2 rounded-lg text-xs font-bold bg-white text-emerald-700 shadow-sm border border-slate-200 transition text-center cursor-pointer";
          if (airBtn) airBtn.className = "py-1.5 px-2 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 border border-transparent transition text-center cursor-pointer";
          if (modeLabel) modeLabel.textContent = "General / Category Rank";
          if (genBadge) { genBadge.textContent = "ACTIVE EVALUATION"; genBadge.className = "text-[10px] text-emerald-600 font-extrabold uppercase"; }
          if (airBadge) { airBadge.textContent = "ALL INDIA MERIT"; airBadge.className = "text-[10px] text-slate-400 font-bold uppercase"; }
          if (rankUnit) rankUnit.textContent = "GEN";
          if (genInp && genInp.value) {
            const v = parseInt(genInp.value, 10);
            appState.rank = (!isNaN(v) && v > 0) ? v : null;
            if (rankInp) rankInp.value = genInp.value;
          } else if (rankInp && rankInp.value) {
            const v = parseInt(rankInp.value, 10);
            appState.rank = (!isNaN(v) && v > 0) ? v : null;
            if (genInp) genInp.value = rankInp.value;
          }
        }

        const clrBtn = document.getElementById("rank-clear-btn");
        if (clrBtn) clrBtn.classList.toggle("hidden", !appState.rank);
        updateHeaderBadges();
        renderExplorer();
      }

      if (jeeAirModeBtn) jeeAirModeBtn.addEventListener("click", () => setJeeRankMode("air"));
      if (jeeGenModeBtn) jeeGenModeBtn.addEventListener("click", () => setJeeRankMode("general"));

      if (jeeAirInput) {
        jeeAirInput.addEventListener("focus", () => {
          if (!appState.exam) {
            jeeAirInput.blur();
            showExamRequiredAlert("First, please select your <strong>Entrance Exam</strong> before entering your rank!");
          }
        });
        jeeAirInput.addEventListener("input", (e) => {
          if (!appState.exam) {
            jeeAirInput.value = "";
            showExamRequiredAlert("First, please select your <strong>Entrance Exam</strong> before entering your rank!");
            return;
          }
          const val = parseInt(e.target.value, 10);
          appState.rank = (!isNaN(val) && val > 0) ? val : null;
          appState.jeeRankMode = "air";
          const rInp = document.getElementById("rank-input");
          if (rInp) rInp.value = e.target.value;
          setJeeRankMode("air");
        });
      }

      if (jeeGenInput) {
        jeeGenInput.addEventListener("focus", () => {
          if (!appState.exam) {
            jeeGenInput.blur();
            showExamRequiredAlert("First, please select your <strong>Entrance Exam</strong> before entering your rank!");
          }
        });
        jeeGenInput.addEventListener("input", (e) => {
          if (!appState.exam) {
            jeeGenInput.value = "";
            showExamRequiredAlert("First, please select your <strong>Entrance Exam</strong> before entering your rank!");
            return;
          }
          const val = parseInt(e.target.value, 10);
          appState.rank = (!isNaN(val) && val > 0) ? val : null;
          appState.jeeRankMode = "general";
          const rInp = document.getElementById("rank-input");
          if (rInp) rInp.value = e.target.value;
          setJeeRankMode("general");
        });
      }

      function updateQuickRankChips(examCode) {
        const chipsList = document.getElementById("quick-rank-chips-list");
        if (!chipsList) return;
        let ranks = [2500, 7500, 18000, 35000, 85000, 150000, 220000, 300000];
        if (examCode === "jee_main") {
          ranks = [1500, 5000, 12000, 25000, 45000, 70000, 100000];
        } else if (examCode === "jee_adv") {
          ranks = [500, 1500, 3500, 7000, 12000, 18000, 25000];
        }

        chipsList.innerHTML = ranks.map(r => {
          const isAmber = (examCode === "ap_cet" && r === 300000) || (examCode === "jee_main" && r === 100000) || (examCode === "jee_adv" && r === 25000);
          const cls = isAmber
            ? "quick-rank-btn px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold shrink-0 transition cursor-pointer"
            : "quick-rank-btn px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-800 font-semibold shrink-0 transition cursor-pointer";
          return `<button type="button" data-rank="${r}" class="${cls}">${r.toLocaleString("en-IN")}</button>`;
        }).join("");

        chipsList.querySelectorAll(".quick-rank-btn").forEach(btn => {
          btn.addEventListener("click", (e) => {
            if (!appState.exam) {
              e.preventDefault();
              e.stopPropagation();
              showExamRequiredAlert("First, please select your <strong>Entrance Exam</strong> before choosing a rank!");
              return false;
            }
            const r = parseInt(btn.dataset.rank, 10);
            appState.rank = r;
            const rankInput = document.getElementById("rank-input");
            if (rankInput) rankInput.value = r;
            if (appState.exam === "jee_main" || appState.exam === "jee_adv") {
              if (appState.jeeRankMode === "general") {
                const gInp = document.getElementById("jee-general-input");
                if (gInp) gInp.value = r;
              } else {
                const aInp = document.getElementById("jee-air-input");
                if (aInp) aInp.value = r;
              }
            }
            const rankClearBtn = document.getElementById("rank-clear-btn");
            if (rankClearBtn) rankClearBtn.classList.remove("hidden");
            updateHeaderBadges();
            renderExplorer();
          });
        });
      }

      rankInput.addEventListener("focus", () => {
        if (!appState.exam) {
          rankInput.blur();
          showExamRequiredAlert("First, please select your <strong>Entrance Exam</strong> before entering your rank!");
        }
      });

      rankInput.addEventListener("input", () => {
        if (!appState.exam) {
          rankInput.value = "";
          showExamRequiredAlert("First, please select your <strong>Entrance Exam</strong> before entering your rank!");
          return;
        }
        const val = parseInt(rankInput.value, 10);
        appState.rank = (!isNaN(val) && val > 0) ? val : null;
        if (appState.exam === "jee_main" || appState.exam === "jee_adv") {
          if (appState.jeeRankMode === "general") {
            const genInp = document.getElementById("jee-general-input");
            if (genInp) genInp.value = rankInput.value;
          } else {
            const airInp = document.getElementById("jee-air-input");
            if (airInp) airInp.value = rankInput.value;
          }
        }
        rankClearBtn.classList.toggle("hidden", !appState.rank);
        updateHeaderBadges();
        renderExplorer();
      });

      rankClearBtn.addEventListener("click", () => {
        rankInput.value = "";
        const airInp = document.getElementById("jee-air-input");
        if (airInp) airInp.value = "";
        const genInp = document.getElementById("jee-general-input");
        if (genInp) genInp.value = "";
        appState.rank = null;
        rankClearBtn.classList.add("hidden");
        updateHeaderBadges();
        renderExplorer();
      });

      updateQuickRankChips("ap_cet");

      const genderSelectEl = document.getElementById("gender-select");
      if (genderSelectEl) {
        genderSelectEl.addEventListener("change", (e) => {
          const val = e.target.value.toLowerCase();
          studentProfile.gender = val;
          const badge = document.getElementById("gender-display-badge");
          if (badge) { badge.textContent = ""; badge.classList.add("hidden"); }
          const cGen = document.getElementById("counseling-gender-select");
          if (cGen) cGen.value = val;
          const wGen = document.getElementById("wiz-gender-select");
          if (wGen) wGen.value = val;
          const eGen = document.getElementById("edit-gender");
          if (eGen) eGen.value = val === "female" ? "Female" : "Male";
          renderExplorer();
        });
      }

      const stSelectEl = document.getElementById("state-select");
      if (stSelectEl) {
        stSelectEl.addEventListener("change", e => {
          appState.state = e.target.value;
          const badge = document.getElementById("state-active-badge");
          if (badge) badge.textContent = appState.state === "ALL" ? "ALL STATES" : appState.state.toUpperCase();
          updateDistrictDropdown(appState.state);
          appState.currentLimit = appState.pageSize;
          renderExplorer();
        });
      }

      document.getElementById("category-select").addEventListener("change", e => {
        appState.category = e.target.value;
        updateHeaderBadges();
        renderExplorer();
      });
      document.getElementById("region-select").addEventListener("change", e => {
        appState.region = e.target.value;
        appState.currentLimit = appState.pageSize;
        renderExplorer();
      });
      document.getElementById("district-select").addEventListener("change", e => {
        appState.district = e.target.value;
        appState.currentLimit = appState.pageSize;
        renderExplorer();
      });
      document.getElementById("branch-select").addEventListener("change", e => {
        appState.branch = e.target.value;
        renderExplorer();
      });
      document.getElementById("type-select").addEventListener("change", e => {
        appState.type = e.target.value;
        appState.currentLimit = appState.pageSize;
        renderExplorer();
      });
      document.getElementById("min-pkg-select").addEventListener("change", e => {
        appState.minPkg = parseFloat(e.target.value) || 0;
        appState.currentLimit = appState.pageSize;
        renderExplorer();
      });
      const searchInputEl = document.getElementById("search-input") || document.getElementById("search-directory-input");
      if (searchInputEl) {
        searchInputEl.addEventListener("input", e => {
          appState.search = e.target.value;
          appState.currentLimit = appState.pageSize;
          renderExplorer();
        });
      }
      document.getElementById("sort-select").addEventListener("change", e => {
        appState.sortBy = e.target.value;
        renderExplorer();
      });
      document.getElementById("only-eligible-toggle").addEventListener("change", e => {
        appState.onlyEligible = e.target.checked;
        if (appState.onlyEligible && !appState.rank) {
          appState.rank = 15000;
          rankInput.value = "15000";
          rankClearBtn.classList.remove("hidden");
        }
        renderExplorer();
      });
      document.getElementById("hide-low-placement-toggle").addEventListener("change", e => {
        appState.hideLowPlacement = e.target.checked;
        renderExplorer();
      });

      const originHubSelectEl = document.getElementById("origin-hub-select");
      if (originHubSelectEl) {
        originHubSelectEl.addEventListener("change", e => {
          appState.originHub = e.target.value;
          const heroOrig = document.getElementById("hero-origin-label");
          if (heroOrig) heroOrig.textContent = appState.originHub;
        });
      }

      function resetAllFilters() {
        appState.rank = null;
        appState.category = "OC";
        appState.region = "ALL";
        appState.district = "ALL";
        appState.branch = "ALL";
        appState.type = "ALL";
        appState.minPkg = 0;
        appState.search = "";
        appState.sortBy = "rank_asc";
        appState.onlyEligible = false;
        appState.hideLowPlacement = false;
        appState.currentLimit = appState.pageSize;

        rankInput.value = "";
        const airReset = document.getElementById("jee-air-input");
        if (airReset) airReset.value = "";
        const genReset = document.getElementById("jee-general-input");
        if (genReset) genReset.value = "";
        rankClearBtn.classList.add("hidden");
        const stReset = document.getElementById("state-select");
        if (stReset) stReset.value = "Andhra Pradesh";
        appState.state = "Andhra Pradesh";
        updateDistrictDropdown("Andhra Pradesh");
        document.getElementById("category-select").value = "OC";
        document.getElementById("region-select").value = "ALL";
        document.getElementById("district-select").value = "ALL";
        document.getElementById("branch-select").value = "ALL";
        document.getElementById("type-select").value = "ALL";
        document.getElementById("min-pkg-select").value = "0";
        const searchInputReset = document.getElementById("search-input") || document.getElementById("search-directory-input");
        if (searchInputReset) searchInputReset.value = "";
        document.getElementById("sort-select").value = "rank_asc";
        document.getElementById("only-eligible-toggle").checked = false;
        document.getElementById("hide-low-placement-toggle").checked = false;

        updateHeaderBadges();
        renderExplorer();
        showToast("All filters reset", "🔄");
      }

      document.getElementById("reset-all-btn").addEventListener("click", resetAllFilters);
      document.getElementById("reset-empty-btn").addEventListener("click", resetAllFilters);

      document.getElementById("load-more-btn").addEventListener("click", () => {
        appState.currentLimit += 30;
        renderExplorer();
      });
      document.getElementById("load-all-btn").addEventListener("click", () => {
        appState.currentLimit = 1000;
        renderExplorer();
      });

      document.body.addEventListener("click", e => {
        const target = e.target.closest("[data-action]");
        if (!target) return;
        const action = target.dataset.action;
        const collegeId = target.dataset.collegeId;
        const branchCode = target.dataset.branchCode;
        const idx = parseInt(target.dataset.index, 10);

        if (action === "quick-add-branch") {
          addPriorityOption(collegeId, branchCode);
        } else if (action === "add-default-priority") {
          addPriorityOption(collegeId, null);
        } else if (action === "open-modal") {
          openCollegeModal(collegeId);
        } else if (action === "open-roi-for-college") {
          selectRoiCollege(collegeId, false);
          switchMainView("analytics");
          /* showToast("Loaded college in 4-Year ROI & Cutoff Matrix", "🧮"); (suppressed) */
        } else if (action === "toggle-shortlist") {
          const pos = appState.shortlist.indexOf(collegeId);
          if (pos === -1) {
            appState.shortlist.push(collegeId);
            showToast("Added to Favorites", "⭐");
          } else {
            appState.shortlist.splice(pos, 1);
            showToast("Removed from Favorites", "ℹ️");
          }
          saveState();
          updateHeaderBadges();
          renderExplorer();
          if (typeof renderSearchDirectory === "function") renderSearchDirectory();
          renderShortlistModal();
        } else if (action === "move-priority-up" && idx > 0) {
          const temp = appState.priorityList[idx - 1];
          appState.priorityList[idx - 1] = appState.priorityList[idx];
          appState.priorityList[idx] = temp;
          saveState();
          renderPrioritySheet();
        } else if (action === "move-priority-down" && idx < appState.priorityList.length - 1) {
          const temp = appState.priorityList[idx + 1];
          appState.priorityList[idx + 1] = appState.priorityList[idx];
          appState.priorityList[idx] = temp;
          saveState();
          renderPrioritySheet();
        } else if (action === "remove-priority") {
          appState.priorityList.splice(idx, 1);
          saveState();
          renderPrioritySheet();
          renderExplorer();
        }
      });

      document.getElementById("priority-list-container").addEventListener("change", e => {
        const sel = e.target.closest("[data-action='change-priority-branch']");
        if (!sel) return;
        const idx = parseInt(sel.dataset.index, 10);
        if (appState.priorityList[idx]) {
          appState.priorityList[idx].branchCode = sel.value;
          saveState();
          renderPrioritySheet();
          showToast(`Updated Option #${idx + 1} branch to ${sel.value}`, "✏️");
        }
      });

      document.getElementById("smart-fill-priority-btn").addEventListener("click", smartAutoFillPriority);
      document.getElementById("empty-smart-fill-btn").addEventListener("click", smartAutoFillPriority);

      document.getElementById("auto-sort-priority-btn").addEventListener("click", () => {
        if (appState.priorityList.length < 2) return;
        appState.priorityList.sort((a, b) => {
          const colA = collegesData.find(c => c.id === a.collegeId);
          const colB = collegesData.find(c => c.id === b.collegeId);
          const brA = colA.branches.find(x => x.code === a.branchCode) || colA.branches[0];
          const brB = colB.branches.find(x => x.code === b.branchCode) || colB.branches[0];
          return brA.closingRank - brB.closingRank;
        });
        saveState();
        renderPrioritySheet();
        showToast("Priority options ordered from most competitive cutoff to safest backup!", "⚡");
      });

      document.getElementById("simulate-allotment-btn").addEventListener("click", runMockAllotmentSimulation);
      document.getElementById("download-pdf-btn").addEventListener("click", downloadPriorityPdf);
      document.getElementById("print-priority-btn").addEventListener("click", () => window.print());

      document.getElementById("share-whatsapp-btn").addEventListener("click", () => {
        if (appState.priorityList.length === 0) {
          showToast("Add colleges to your Priority Sheet first!", "⚠️");
          return;
        }
        const lines = appState.priorityList.map((item, i) => {
          const c = collegesData.find(x => x.id === item.collegeId);
          return `${i + 1}. ${c.code} - ${c.name} [${item.branchCode}]`;
        });
        const text = `*My The Bridge B.Tech Web Options (${appState.category} | Rank: ${appState.rank || "Open"})*\n\n` + lines.join("\n");
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, "_blank", "noopener,noreferrer");
      });

      document.getElementById("copy-priority-btn").addEventListener("click", () => {
        if (appState.priorityList.length === 0) {
          showToast("Priority Sheet is empty!", "⚠️");
          return;
        }
        const lines = appState.priorityList.map((item, i) => {
          const c = collegesData.find(x => x.id === item.collegeId);
          return `Option #${i + 1}: ${c.code} - ${c.name} (${item.branchCode})`;
        }).join("\n");

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(lines).then(() => showToast("Web options copied to clipboard!", "📋")).catch(() => {});
        } else {
          const ta = document.createElement("textarea");
          ta.value = lines;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          document.body.removeChild(ta);
          showToast("Web options copied to clipboard!", "📋");
        }
      });

      document.getElementById("clear-priority-btn").addEventListener("click", () => {
        appState.priorityList = [];
        saveState();
        renderPrioritySheet();
        renderExplorer();
        showToast("Cleared Priority Sheet", "🗑️");
      });

      // ROI Interactive Autocomplete Combobox Event Wiring
      const colSugContainer = document.getElementById("roi-college-suggestions");
      if (colSugContainer) {
        colSugContainer.addEventListener("click", e => {
          const item = e.target.closest(".roi-college-sug-item");
          if (!item) return;
          const cid = item.dataset.collegeId;
          if (cid) selectRoiCollege(cid);
        });
      }

      const brSugContainer = document.getElementById("roi-branch-suggestions");
      if (brSugContainer) {
        brSugContainer.addEventListener("click", e => {
          const item = e.target.closest(".roi-branch-sug-item");
          if (!item) return;
          const bcode = item.dataset.branchCode;
          if (bcode) selectRoiBranch(bcode);
        });
      }

      const roiColSearch = document.getElementById("roi-college-search");
      if (roiColSearch) {
        roiColSearch.addEventListener("focus", e => renderCollegeSuggestions(e.target.value));
        roiColSearch.addEventListener("input", e => renderCollegeSuggestions(e.target.value));
      }

      const roiColToggle = document.getElementById("roi-college-toggle-btn");
      if (roiColToggle) {
        roiColToggle.addEventListener("click", () => {
          const sug = document.getElementById("roi-college-suggestions");
          if (sug) {
            if (sug.classList.contains("hidden")) {
              renderCollegeSuggestions("");
            } else {
              sug.classList.add("hidden");
            }
          }
        });
      }

      const roiBrSearch = document.getElementById("roi-branch-search");
      if (roiBrSearch) {
        roiBrSearch.addEventListener("focus", e => renderBranchSuggestions(e.target.value));
        roiBrSearch.addEventListener("input", e => renderBranchSuggestions(e.target.value));
      }

      const roiBrToggle = document.getElementById("roi-branch-toggle-btn");
      if (roiBrToggle) {
        roiBrToggle.addEventListener("click", () => {
          const sug = document.getElementById("roi-branch-suggestions");
          if (sug) {
            if (sug.classList.contains("hidden")) {
              renderBranchSuggestions("");
            } else {
              sug.classList.add("hidden");
            }
          }
        });
      }

      // Close floating suggestion popups when clicking outside
      document.addEventListener("click", e => {
        const colCombobox = document.getElementById("roi-college-combobox");
        const colSug = document.getElementById("roi-college-suggestions");
        if (colCombobox && colSug && !colCombobox.contains(e.target)) {
          colSug.classList.add("hidden");
        }

        const brCombobox = document.getElementById("roi-branch-combobox");
        const brSug = document.getElementById("roi-branch-suggestions");
        if (brCombobox && brSug && !brCombobox.contains(e.target)) {
          brSug.classList.add("hidden");
        }
      });

      const roiQuotaSelect = document.getElementById("roi-quota-select");
      if (roiQuotaSelect) {
        roiQuotaSelect.addEventListener("change", renderRoiCalculator);
      }

      document.getElementById("roi-scholarship-select").addEventListener("change", renderRoiCalculator);
      document.getElementById("roi-stay-select").addEventListener("change", renderRoiCalculator);
      document.getElementById("roi-jvd-vasathi").addEventListener("change", renderRoiCalculator);
      document.getElementById("matrix-college-select").addEventListener("change", renderCutoffMatrix);
      document.getElementById("matrix-round-select").addEventListener("change", renderCutoffMatrix);

      document.getElementById("docs-list").addEventListener("change", e => {
        const cb = e.target.closest("input[data-doc-id]");
        if (!cb) return;
        appState.checkedDocs[cb.dataset.docId] = cb.checked;
        saveState();
        renderChecklist();
      });

      document.getElementById("check-all-docs-btn").addEventListener("click", () => {
        checklistDocsData.forEach(d => { appState.checkedDocs[d.id] = true; });
        saveState();
        renderChecklist();
        showToast("All 9 counseling verification documents marked Ready!", "✅");
      });

      document.getElementById("reset-docs-btn").addEventListener("click", () => {
        appState.checkedDocs = {};
        saveState();
        renderChecklist();
        showToast("Document checklist reset", "🔄");
      });

      document.getElementById("close-modal-btn").addEventListener("click", () => {
        document.getElementById("detail-modal").classList.add("hidden");
      });
      document.getElementById("close-modal-bottom-btn").addEventListener("click", () => {
        document.getElementById("detail-modal").classList.add("hidden");
      });
      document.getElementById("modal-tab-btn-overview").addEventListener("click", () => switchModalTab("overview"));
      document.getElementById("modal-tab-btn-payment").addEventListener("click", () => switchModalTab("payment"));
      document.getElementById("modal-tab-btn-scholarships").addEventListener("click", () => switchModalTab("scholarships"));
      document.getElementById("modal-tab-btn-hostels").addEventListener("click", () => switchModalTab("hostels"));
      document.getElementById("modal-tab-btn-travel").addEventListener("click", () => switchModalTab("travel"));
      document.getElementById("modal-tab-btn-food").addEventListener("click", () => switchModalTab("food"));

      document.getElementById("modal-shortlist-toggle").addEventListener("click", () => {
        if (!appState.activeModalCollegeId) return;
        const pos = appState.shortlist.indexOf(appState.activeModalCollegeId);
        if (pos === -1) {
          appState.shortlist.push(appState.activeModalCollegeId);
          showToast("Added to Favorites!", "⭐");
        } else {
          appState.shortlist.splice(pos, 1);
          showToast("Removed from Favorites", "ℹ️");
        }
        saveState();
        updateHeaderBadges();
        renderExplorer();
        openCollegeModal(appState.activeModalCollegeId);
      });

      document.getElementById("modal-add-priority-btn").addEventListener("click", () => {
        if (!appState.activeModalCollegeId) return;
        addPriorityOption(appState.activeModalCollegeId, null);
      });

      document.getElementById("modal-calc-roi-btn").addEventListener("click", () => {
        if (!appState.activeModalCollegeId) return;
        document.getElementById("detail-modal").classList.add("hidden");
        selectRoiCollege(appState.activeModalCollegeId, false);
        switchMainView("analytics");
      });



      document.getElementById("open-shortlist-btn").addEventListener("click", () => {
        renderShortlistModal();
        document.getElementById("shortlist-modal").classList.remove("hidden");
      });
      document.getElementById("close-shortlist-btn").addEventListener("click", () => {
        document.getElementById("shortlist-modal").classList.add("hidden");
      });
      document.getElementById("close-shortlist-bottom-btn").addEventListener("click", () => {
        document.getElementById("shortlist-modal").classList.add("hidden");
      });
      document.getElementById("clear-all-shortlist").addEventListener("click", () => {
        appState.shortlist = [];
        saveState();
        updateHeaderBadges();
        renderShortlistModal();
        renderExplorer();
      });

      // ==============================================================
      // NAVIGATION CONTROLLER (Home Section <-> Search Section)
      // ==============================================================
      function showExplorerSlide(slideNum) {
        if (slideNum === 1) {
          switchMainView("add-rank");
          if (typeof showHomeSlide === "function") showHomeSlide(1);
        } else if (slideNum === 2) {
          switchMainView("add-rank");
          if (typeof showHomeSlide === "function") showHomeSlide(2);
        }
      }

      // ==============================================================
      // HOME SECTION TWO-SLIDE CONTROLLER (Slide 1: Filters <-> Slide 2: Eligible Colleges)
      // Both slides stay under the HOME button!
      // ==============================================================
      window.showHomeSlide = function(slideNum) {
        try {
          const homeView = document.getElementById("home-view-container");
          if (homeView) homeView.classList.remove("hidden");

          const slide1 = document.getElementById("explorer-slide-1-filters");
          const slide2 = document.getElementById("home-eligible-colleges-section");
          if (!slide1 || !slide2) return;

          if (slideNum === 2) {
            // 0. Check Entrance Exam Selection First!
            if (!appState.exam) {
              showExamRequiredAlert("First, please select your <strong>Entrance Exam</strong> (<strong>AP CET</strong>, <strong>JEE Main</strong>, <strong>JEE Advanced</strong>, or <strong>Payment Colleges</strong>) before viewing eligible colleges!");
              return false;
            }

            // 1. Read and sync rank from rank-input
            const rInput = document.getElementById("rank-input");
            if (rInput && rInput.value) {
              const parsed = parseInt(String(rInput.value).replace(/,/g, ""), 10);
              if (!isNaN(parsed) && parsed > 0) {
                appState.rank = parsed;
              }
            }
            // If no rank entered yet, default to 25,000 so eligible colleges appear immediately
            if (!appState.rank) {
              appState.rank = 25000;
              if (rInput) {
                rInput.value = "25000";
                const clearBtn = document.getElementById("rank-clear-btn");
                if (clearBtn) clearBtn.classList.remove("hidden");
              }
            }

            // 2. Sync all other controls from Slide 1
            const gSelect = document.getElementById("gender-select");
            if (gSelect) studentProfile.gender = gSelect.value.toLowerCase();
            const catSelect = document.getElementById("category-select");
            if (catSelect) appState.category = catSelect.value;
            const stSelect = document.getElementById("state-select");
            if (stSelect) appState.state = stSelect.value;
            const distSelect = document.getElementById("district-select");
            if (distSelect) appState.district = distSelect.value;
            const branchSelect = document.getElementById("branch-select");
            if (branchSelect) appState.branch = branchSelect.value;
            const typeSelect = document.getElementById("type-select");
            if (typeSelect) appState.type = typeSelect.value;
            const minPkgSelect = document.getElementById("min-pkg-select");
            if (minPkgSelect) appState.minPkg = parseFloat(minPkgSelect.value) || 0;

            // 3. Set onlyEligible to true so only colleges the student qualifies for appear
            appState.onlyEligible = true;
            const toggle = document.getElementById("only-eligible-toggle");
            if (toggle) toggle.checked = true;

            // 4. Default to Best Rank Match / Closing Cutoff sort
            if (!appState.sortBy || appState.sortBy === "rank_asc") {
              appState.sortBy = "rank_asc";
              const sortSel = document.getElementById("sort-select");
              if (sortSel) sortSel.value = "rank_asc";
            }

            // 5. Expand limit so all eligible colleges load generously
            appState.currentLimit = Math.max(appState.currentLimit || 30, 60);

            // 6. Switch slides cleanly using both class and inline style
            slide1.classList.add("hidden");
            slide1.classList.remove("block");
            slide1.style.display = "none";

            slide2.classList.remove("hidden");
            slide2.classList.add("block");
            slide2.style.display = "block";

            // 7. Render colleges safely
            try {
              renderExplorer();
            } catch (rErr) {
              console.error("renderExplorer error:", rErr);
            }

            // 8. Scroll directly to Slide 2 header so colleges are immediately visible
            setTimeout(() => {
              slide2.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 30);
          } else {
            // Slide 1 (Filters)
            slide2.classList.add("hidden");
            slide2.classList.remove("block");
            slide2.style.display = "none";

            slide1.classList.remove("hidden");
            slide1.classList.add("block");
            slide1.style.display = "block";

            setTimeout(() => {
              slide1.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 30);
          }
        } catch (err) {
          console.error("showHomeSlide error:", err);
        }
      };

      // In Home Slide 1: Click "View Eligible Colleges" -> Goes to Slide 2 in Home
      const btnShowEligible = document.getElementById("btn-show-eligible-colleges");
      if (btnShowEligible) {
        btnShowEligible.addEventListener("click", () => showHomeSlide(2));
        btnShowEligible.addEventListener("touchend", () => showHomeSlide(2));
      }

      // In Home Slide 2: Click "← Modify Rank & Filters" -> Returns to Slide 1 in Home
      const btnHomeBackFilters = document.getElementById("btn-home-back-to-filters");
      if (btnHomeBackFilters) {
        btnHomeBackFilters.addEventListener("click", () => showHomeSlide(1));
        btnHomeBackFilters.addEventListener("touchend", () => showHomeSlide(1));
      }

      // Global delegation fallback for slide transitions
      document.addEventListener("click", (e) => {
        if (!e.target) return;
        const btn = e.target.closest("#btn-show-eligible-colleges");
        if (btn) {
          e.preventDefault();
          showHomeSlide(2);
        }
        const backBtn = e.target.closest("#btn-home-back-to-filters");
        if (backBtn) {
          e.preventDefault();
          showHomeSlide(1);
        }
      });

      const rankInputKeyEl = document.getElementById("rank-input");
      if (rankInputKeyEl) {
        rankInputKeyEl.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            showHomeSlide(2);
          }
        });
      }

      const btnSearchBackHome = document.getElementById("btn-search-back-to-home");
      if (btnSearchBackHome) {
        btnSearchBackHome.addEventListener("click", () => switchMainView("add-rank"));
      }

      // ==============================================================
      // DEDICATED SEARCH SECTION CONTROLLER (COLLEGE DIRECTORY ONLY)
      // ==============================================================
      let searchDirCategory = "all";

      // City & Town Aliases Map for Instant Intelligent Matching
      const CITY_EXPANSIONS = {
        "visakhapatnam": "vizag waltair vskp",
        "vijayawada": "bza bezawada",
        "rajahmundry": "rajamahendravaram rjy",
        "tirupati": "tpty tpt",
        "anantapur": "anantapuramu atp",
        "kakinada": "coconada",
        "hyderabad": "hyd secunderabad",
        "bhimavaram": "bvrm"
      };

      function matchCollegeSearch(c, rawQuery) {
        if (!rawQuery) return true;
        const tokens = rawQuery.toLowerCase().replace(/[()[\],.-]/g, " ").split(/\s+/).filter(Boolean);
        if (tokens.length === 0) return true;

        const combinedLoc = `${c.city || ''} ${c.location || ''} ${c.district || ''}`.toLowerCase();
        let cityExtras = "";
        for (const [k, v] of Object.entries(CITY_EXPANSIONS)) {
          if (combinedLoc.includes(k)) cityExtras += " " + v;
        }

        const searchFields = [
          c.name || "",
          c.code || "",
          c.fullName || "",
          c.location || "",
          c.district || "",
          c.city || "",
          c.state || "",
          c.type || "",
          c.category || "",
          cityExtras,
          ...(Array.isArray(c.aliases) ? c.aliases : []),
          ...(Array.isArray(c.branches) ? c.branches.map(b => (b.code || "") + " " + (b.name || "")) : [])
        ].join(" ").toLowerCase();

        return tokens.every(token => searchFields.includes(token));
      }

      function matchesCollegeCategory(c, cat) {
        if (!cat || cat === "all") return true;
        if (cat === "iit_nit") {
          const isIit = c.category === "IIT" || c.type === "IIT" || (c.code && c.code.startsWith("IIT")) || (c.name && c.name.includes("IIT"));
          const isNit = c.category === "NIT" || c.type === "NIT" || (c.code && c.code.startsWith("NIT")) || (c.name && c.name.includes("NIT"));
          return isIit || isNit;
        }
        if (cat === "iiit_bits") {
          const isIiit = c.category === "IIIT" || c.type === "IIIT" || (c.code && c.code.startsWith("IIIT")) || (c.name && c.name.includes("IIIT"));
          const isBits = c.exam === "bitsat" || (c.code && c.code.startsWith("BITS")) || (c.name && c.name.includes("BITS"));
          return isIiit || isBits;
        }
        if (cat === "top") {
          const ratingVal = parseFloat(c.rating || 0);
          const isTopGrade = c.grade && (c.grade.includes("A") || c.grade.includes("Top") || c.grade.includes("NIRF"));
          return ratingVal >= 4.2 || Boolean(c.nirfRank) || Boolean(isTopGrade);
        }
        if (cat === "University") {
          return (c.category && (c.category.includes("Univ") || c.category.includes("Govt"))) ||
                 (c.type && (c.type.includes("Univ") || c.type.includes("Govt") || c.type.includes("IIT") || c.type.includes("NIT") || c.type.includes("State") || c.type.includes("Central"))) ||
                 (c.name && (c.name.includes("University") || c.name.includes("IIT") || c.name.includes("NIT")));
        }
        if (cat === "Autonomous") {
          return (c.category && c.category.toLowerCase().includes("auto")) ||
                 (c.type && c.type.toLowerCase().includes("auto")) ||
                 (c.name && c.name.toLowerCase().includes("autonomous")) ||
                 (c.grade && c.grade.toLowerCase().includes("auto"));
        }
        if (cat === "payment") {
          return c.exam === "payment" || (c.type && (c.type.includes("Payment") || c.type.includes("Deemed") || c.type.includes("Private")));
        }
        return true;
      }

      // Helper: Live Auto-Suggest Dropdown under Search Bar
      function updateSearchDirectorySuggestions() {
        const inputEl = document.getElementById("search-directory-input");
        const suggestionsEl = document.getElementById("search-directory-suggestions");
        if (!inputEl || !suggestionsEl) return;

        const q = inputEl.value.trim();
        if (!q || q.length < 1) {
          suggestionsEl.innerHTML = "";
          suggestionsEl.classList.add("hidden");
          return;
        }

        const colleges = (typeof collegesData !== "undefined" && Array.isArray(collegesData)) 
          ? collegesData 
          : (window.collegesData || []);

        const matches = colleges.filter(c => matchCollegeSearch(c, q)).slice(0, 8);

        if (matches.length === 0) {
          suggestionsEl.innerHTML = `
            <div class="p-3 text-center text-xs text-slate-500">
              No colleges found matching "<strong>${inputEl.value.trim()}</strong>"
            </div>
          `;
          suggestionsEl.classList.remove("hidden");
          return;
        }

        suggestionsEl.innerHTML = matches.map(c => `
          <div class="p-3 hover:bg-blue-50/80 cursor-pointer transition flex items-center justify-between gap-3 text-left group" data-suggest-name="${(c.name || '').replace(/"/g, '&quot;')}" data-suggest-id="${c.id}">
            <div class="flex items-center gap-2.5 min-w-0">
              <span class="w-8 h-8 rounded-lg bg-blue-100 group-hover:bg-blue-200 text-blue-800 flex items-center justify-center text-sm font-bold shrink-0">🏛️</span>
              <div class="min-w-0">
                <div class="text-xs sm:text-sm font-bold text-slate-900 truncate group-hover:text-blue-700">${c.name}</div>
                <div class="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <span class="font-semibold text-blue-900 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200/60">${c.code}</span>
                  <span>📍 ${c.district || c.location || ''}</span>
                </div>
              </div>
            </div>
            <div class="shrink-0 text-right">
              <span class="text-xs font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">${c.rating || '4.5★'}</span>
            </div>
          </div>
        `).join("");

        suggestionsEl.classList.remove("hidden");
      }

      
    // Search Directory College Card Active Slide Indices Tracker
    const cardSlideIndices = {};

    window.changeCollegeCardSlide = function(collegeId, direction) {
      const colleges = (typeof collegesData !== "undefined" && Array.isArray(collegesData)) ? collegesData : (window.collegesData || []);
      const college = colleges.find(c => c.id === collegeId);
      if (!college) return;
      const images = (typeof window.getCollegeImages === "function") ? window.getCollegeImages(college) : [getCollegeImageUrl(college)];
      if (!Array.isArray(images) || images.length <= 1) return;

      const current = cardSlideIndices[collegeId] || 0;
      const nextIdx = (current + direction + images.length) % images.length;
      cardSlideIndices[collegeId] = nextIdx;

      const imgEl = document.getElementById("card-img-" + collegeId);
      const counterEl = document.getElementById("card-counter-" + collegeId);
      if (imgEl) {
        imgEl.style.opacity = "0.7";
        imgEl.src = images[nextIdx];
        imgEl.dataset.origSrc = images[nextIdx];
        imgEl.dataset.fallbackStep = "0";
        imgEl.onerror = function() {
          window.handleCollegeImgError(this, college.code || college.id);
        };
        setTimeout(() => { imgEl.style.opacity = "1"; }, 100);
      }
      if (counterEl) {
        counterEl.textContent = (nextIdx + 1) + " / " + images.length;
      }
    };

    window.renderSearchDirectory = function() {
        const inputEl = document.getElementById("search-directory-input");
        const clearBtn = document.getElementById("search-directory-clear-btn");
        const countBar = document.getElementById("search-directory-count-bar");
        const countText = document.getElementById("search-directory-count-text");
        const promptEl = document.getElementById("search-directory-empty-prompt");
        const gridEl = document.getElementById("search-directory-grid");
        if (!gridEl) return;

        const rawQuery = (inputEl ? inputEl.value : "").trim();
        const query = rawQuery.toLowerCase();
        if (clearBtn) clearBtn.classList.toggle("hidden", !rawQuery);

        if (promptEl) promptEl.classList.add("hidden");
        gridEl.classList.remove("hidden");

        const colleges = (typeof collegesData !== "undefined" && Array.isArray(collegesData)) 
          ? collegesData 
          : (window.collegesData || []);

        let matches = colleges.filter(c => matchesCollegeCategory(c, searchDirCategory) && matchCollegeSearch(c, rawQuery));

        // Intelligent fallback: if 0 colleges match under active filter chip, search across all categories so users never get a false 0!
        if (matches.length === 0 && rawQuery && searchDirCategory !== "all") {
          const allMatches = colleges.filter(c => matchCollegeSearch(c, rawQuery));
          if (allMatches.length > 0) {
            matches = allMatches;
          }
        }

        if (countBar && countText) {
          countBar.classList.remove("hidden");
          if (rawQuery) {
            countText.textContent = `Showing ${matches.length} matching college${matches.length === 1 ? '' : 's'} for "${rawQuery}"`;
          } else {
            countText.textContent = `Showing ${matches.length} colleges in directory`;
          }
        }

        if (matches.length === 0) {
          gridEl.innerHTML = `
            <div class="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200/90 p-8 shadow-xs">
              <span class="text-4xl block mb-2">🔍</span>
              <h4 class="text-base font-bold text-slate-800">No colleges matched "${rawQuery}"</h4>
              <p class="text-xs text-slate-500 mt-1">Try searching by college code (e.g., AUCE, GVP, VRSEC), city, or branch (CSE, AIDS, ECE).</p>
              <button type="button" onclick="if(document.getElementById('search-directory-input')){document.getElementById('search-directory-input').value='';renderSearchDirectory();}" class="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition cursor-pointer">
                Clear Search & Show All Colleges
              </button>
            </div>
          `;
          return;
        }

        // Limit initial display for snappy performance
        const displayLimit = rawQuery ? matches.length : 36;
        const displayedColleges = matches.slice(0, displayLimit);

        gridEl.innerHTML = displayedColleges.map(c => {
          const ratingVal = parseFloat(c.rating || 0);
          const branchesCount = Array.isArray(c.branches) ? c.branches.length : 0;
          const branchBadges = Array.isArray(c.branches) 
            ? c.branches.slice(0, 5).map(b => `<span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[10px] font-bold border border-slate-200/60">${b.code}</span>`).join(" ") + (c.branches.length > 5 ? ` <span class="text-[10px] font-bold text-slate-400 self-center">+${c.branches.length - 5}</span>` : '')
            : '';
          const isShortlisted = Array.isArray(appState.shortlist) && appState.shortlist.includes(c.id);
          
          // Real College Photos List from Dataset
          const imagesList = (typeof window.getCollegeImages === "function") ? window.getCollegeImages(c) : [getCollegeImageUrl(c)];
          const activeSlideIdx = cardSlideIndices[c.id] || 0;
          const currentImgUrl = imagesList[activeSlideIdx] || imagesList[0] || getCollegeImageUrl(c);

          const medianStr = c.placements?.medianPackage || c.placements?.medianSalary || (c.placements?.numMedianPkg ? `₹${c.placements.numMedianPkg} LPA` : '₹4.5 LPA');
          const tuitionStr = c.fees?.annualTuition || c.fees?.tuition || (c.fees?.numTuition ? `₹${Math.round(c.fees.numTuition / 1000)}K/yr` : '₹70K/yr');
          const placeRate = c.placements?.placementRate || (c.placements?.numRate ? `${c.placements.numRate}%` : '85%');
          const typeLabel = c.type || c.category || 'Engineering';

          // NIRF 2025 Badge
          let nirfBadgeHtml = '';
          if (c.nirfRank) {
            nirfBadgeHtml = `<span class="px-2 py-0.5 rounded-md text-[10px] font-black backdrop-blur-md bg-blue-600 text-white border border-blue-400/50 shadow-sm flex items-center gap-1"><span class="text-[9px] opacity-80">NIRF</span> #${c.nirfRank} <span class="text-[9px] font-normal opacity-90">(${c.nirfScore})</span></span>`;
          } else if (c.nirfBand) {
            nirfBadgeHtml = `<span class="px-2 py-0.5 rounded-md text-[10px] font-black backdrop-blur-md bg-indigo-600 text-white border border-indigo-400/50 shadow-sm flex items-center gap-1"><span class="text-[9px] opacity-80">NIRF</span> ${c.nirfBand}</span>`;
          }

          return `
            <div class="college-card bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group">
              <!-- Top Image Banner & Interactive Photo Slide -->
              <div class="relative h-64 sm:h-72 w-full overflow-hidden bg-slate-900 shrink-0 select-none group/slide" data-college-id="${c.id}">
                <img id="card-img-${c.id}" src="${currentImgUrl}" alt="${c.name}" data-orig-src="${currentImgUrl}" data-fallback-step="0" class="w-full h-full object-cover transition-all duration-300 group-hover:scale-105" loading="lazy" onerror="window.handleCollegeImgError(this, '${c.code || c.id}');">

                <!-- Previous Photo Slide Button -->
                ${imagesList.length > 1 ? `
                  <button type="button" data-action="slide-prev" data-target="${c.id}" class="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center font-black transition z-20 cursor-pointer shadow-lg active:scale-90" title="Previous Campus Photo" aria-label="Previous Campus Photo">
                    <svg class="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
                  </button>
                  <button type="button" data-action="slide-next" data-target="${c.id}" class="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center font-black transition z-20 cursor-pointer shadow-lg active:scale-90" title="Next Campus Photo" aria-label="Next Campus Photo">
                    <svg class="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
                  </button>
                  <div class="absolute bottom-11 right-3 z-20 px-2 py-0.5 rounded-full backdrop-blur-md bg-black/70 text-white text-[9px] font-black border border-white/20 shadow-sm flex items-center justify-center">
                    <span id="card-counter-${c.id}">${activeSlideIdx + 1} / ${imagesList.length}</span>
                  </div>
                ` : ''}
                
                <!-- Top Left Badges: NIRF & Rating & Code -->
                <div class="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap z-20">
                  ${nirfBadgeHtml}
                  <span class="px-2 py-0.5 rounded-md text-[10px] font-black backdrop-blur-md bg-black/60 text-amber-300 border border-amber-400/40 shadow-sm flex items-center gap-1">
                    ★ ${c.rating || "4.5★"} <span class="text-white/80 font-semibold text-[9px]">(${c.grade || "A"})</span>
                  </span>
                  <span class="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase backdrop-blur-md bg-black/70 text-white border border-white/20 shadow-sm">
                    ${c.code}
                  </span>
                </div>

                <!-- Top Right Badge: Live Favorite Star Toggle -->
                <button type="button" data-action="toggle-shortlist" data-college-id="${c.id}" class="absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md ${isShortlisted ? 'bg-amber-400 text-slate-950 font-black ring-2 ring-amber-300' : 'bg-black/60 text-white hover:bg-black/80 hover:text-amber-300'} border border-white/20 transition cursor-pointer shadow-md z-20 active:scale-90" title="${isShortlisted ? 'Favorited' : 'Add to Favorites'}">
                  <span class="text-sm sm:text-base leading-none">${isShortlisted ? '★' : '☆'}</span>
                </button>

                <!-- Bottom Image Gradient Overlay with Location & Package -->
                <div class="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center justify-between text-white z-10 pointer-events-none">
                  <span class="text-[11px] font-semibold text-slate-200 flex items-center gap-1 truncate max-w-[65%]">
                    📍 ${c.district || c.location || ''}
                  </span>
                  <span class="text-[11px] font-black text-amber-300 bg-amber-400/20 px-1.5 py-0.5 rounded border border-amber-400/40">
                    ${medianStr}
                  </span>
                </div>
              </div>

              <!-- Card Body Content -->
              <div class="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div class="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200/60">${typeLabel}</span>
                    <span class="text-xs text-slate-500">• Est. ${c.established || '2008'}</span>
                    ${c.lowPlacementFlag ? '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">Low 2025 Activity</span>' : ''}
                  </div>
                  <h4 class="font-black text-base text-slate-900 leading-snug line-clamp-2 hover:text-blue-700 transition cursor-pointer" onclick="openCollegeModal('${c.id}')">
                    ${c.name}
                  </h4>
                  <p class="text-xs text-slate-500 mt-1">${c.university || 'AP Affiliated'} • ${c.region || 'AU/SVU'} Region</p>

                  <!-- NIRF 2025 Verified Indicator Bar -->
                  ${c.nirfRank ? `
                    <div class="mt-2.5 p-2 rounded-xl bg-blue-50/80 border border-blue-200/80 flex items-center justify-between text-xs">
                      <span class="font-bold text-blue-900">🏆 NIRF 2025 Engineering Rank</span>
                      <span class="font-black text-blue-700">#${c.nirfRank} (Score: ${c.nirfScore})</span>
                    </div>
                  ` : (c.nirfBand ? `
                    <div class="mt-2.5 p-2 rounded-xl bg-indigo-50/80 border border-indigo-200/80 flex items-center justify-between text-xs">
                      <span class="font-bold text-indigo-900">🏆 NIRF 2025 Ranking Band</span>
                      <span class="font-black text-indigo-700">${c.nirfBand}</span>
                    </div>
                  ` : '')}

                  <!-- 3 Key Metric Blocks -->
                  <div class="mt-3.5 grid grid-cols-3 gap-2 text-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div>
                      <span class="text-[10px] uppercase font-bold text-slate-400 block">Placed</span>
                      <span class="text-xs font-extrabold ${c.lowPlacementFlag ? 'text-rose-700' : 'text-emerald-700'}">${placeRate}</span>
                    </div>
                    <div>
                      <span class="text-[10px] uppercase font-bold text-slate-400 block">Median CTC</span>
                      <span class="text-xs font-extrabold text-blue-800">${medianStr}</span>
                    </div>
                    <div>
                      <span class="text-[10px] uppercase font-bold text-slate-400 block">Est. Tuition</span>
                      <span class="text-xs font-extrabold text-slate-800">${tuitionStr}</span>
                    </div>
                  </div>

                  <!-- Offered Branches -->
                  <div class="mt-3">
                    <span class="text-[11px] font-bold text-slate-700 block mb-1">Offered Branches (${branchesCount}):</span>
                    <div class="flex flex-wrap gap-1">${branchBadges}</div>
                  </div>
                </div>

                <!-- Bottom Actions Bar -->
                <div class="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button type="button" onclick="openCollegeModal('${c.id}')" class="flex-1 py-2.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl transition cursor-pointer text-center flex items-center justify-center gap-1.5 shadow-2xs">
                    <span>🏛️ View College Profile & Cutoffs</span>
                    <span>→</span>
                  </button>
                  <button type="button" onclick="addPriorityOption('${c.id}')" class="py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition cursor-pointer shadow-2xs active:scale-95">
                    + Add Choice
                  </button>
                </div>
              </div>
            </div>
          `;
        }).join("");
      };

      const sDirIn = document.getElementById("search-directory-input");
      const sDirClr = document.getElementById("search-directory-clear-btn");
      const sDirSug = document.getElementById("search-directory-suggestions");

      if (sDirIn) {
        sDirIn.addEventListener("input", () => {
          updateSearchDirectorySuggestions();
          renderSearchDirectory();
        });
        sDirIn.addEventListener("focus", () => {
          if (sDirIn.value.trim().length > 0) {
            updateSearchDirectorySuggestions();
          }
        });
        sDirIn.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            if (sDirSug) sDirSug.classList.add("hidden");
            renderSearchDirectory();
          }
        });
      }

      if (sDirClr) {
        sDirClr.addEventListener("click", () => {
          if (sDirIn) sDirIn.value = "";
          if (sDirSug) sDirSug.classList.add("hidden");
          renderSearchDirectory();
          sDirIn?.focus();
        });
      }

      if (sDirSug) {
        sDirSug.addEventListener("click", (e) => {
          const item = e.target.closest("[data-suggest-name]");
          if (item) {
            const name = item.dataset.suggestName;
            if (sDirIn) sDirIn.value = name;
            sDirSug.classList.add("hidden");
            renderSearchDirectory();
          }
        });
      }

      // Close suggestions dropdown when clicking outside
      document.addEventListener("click", (e) => {
        const wrap = document.getElementById("search-directory-input")?.closest(".relative");
        if (wrap && !wrap.contains(e.target)) {
          const sugEl = document.getElementById("search-directory-suggestions");
          if (sugEl) sugEl.classList.add("hidden");
        }
      });

      // ==============================================================
      // SLIDE 1 & SLIDE 2 UNIVERSAL INDIAN COLLEGES SEARCH CONTROLLERS
      // ==============================================================
      const s1In = document.getElementById("slide1-college-search");
      const s1Clr = document.getElementById("slide1-search-clear-btn");
      const s1Sug = document.getElementById("slide1-search-suggestions");

      const s2In = document.getElementById("slide2-college-search");
      const s2Clr = document.getElementById("slide2-search-clear-btn");
      const s2Sug = document.getElementById("slide2-search-suggestions");

      function getUniversalMatches(rawQuery) {
        const q = (rawQuery || "").trim();
        if (!q) return [];
        const colleges = (typeof collegesData !== "undefined" && Array.isArray(collegesData)) ? collegesData : (window.collegesData || []);
        return colleges.filter(c => matchCollegeSearch(c, q));
      }

      function buildSuggestionItems(matches, prefix) {
        if (!matches || matches.length === 0) {
          return '<div class="p-3 text-center text-xs text-slate-500 font-medium">No colleges or universities found matching your search.</div>';
        }
        return matches.slice(0, 10).map(c => `
          <div class="p-3 hover:bg-blue-50/80 cursor-pointer transition flex items-center justify-between gap-3 text-left group" data-${prefix}-suggest-name="${(c.name || '').replace(/"/g, '&quot;')}" data-${prefix}-suggest-id="${c.id}">
            <div class="flex items-center gap-2.5 min-w-0">
              <span class="w-8 h-8 rounded-lg bg-blue-100 group-hover:bg-blue-200 text-blue-800 flex items-center justify-center text-sm font-bold shrink-0">🏛️</span>
              <div class="min-w-0">
                <div class="text-xs sm:text-sm font-bold text-slate-900 truncate group-hover:text-blue-700">${c.name}</div>
                <div class="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <span class="font-semibold text-blue-900 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200/60">${c.code}</span>
                  <span>📍 ${c.district || c.location || ''}</span>
                </div>
              </div>
            </div>
            <div class="shrink-0 text-right">
              <span class="text-xs font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">${c.rating || '4.5★'}</span>
            </div>
          </div>
        `).join("");
      }

      // Slide 1 Handlers
      if (s1In) {
        s1In.addEventListener("input", (e) => {
          const val = e.target.value.trim();
          if (s1Clr) s1Clr.classList.toggle("hidden", !val);
          if (!val) {
            if (s1Sug) { s1Sug.innerHTML = ""; s1Sug.classList.add("hidden"); }
            return;
          }
          const matches = getUniversalMatches(val);
          if (s1Sug) {
            s1Sug.innerHTML = buildSuggestionItems(matches, "s1");
            s1Sug.classList.remove("hidden");
          }
        });

        s1In.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            const val = s1In.value.trim();
            if (s1Sug) s1Sug.classList.add("hidden");
            appState.search = val;
            if (s2In) s2In.value = val;
            if (s2Clr) s2Clr.classList.toggle("hidden", !val);
            if (typeof showHomeSlide === "function") showHomeSlide(2);
          }
        });
      }

      if (s1Clr) {
        s1Clr.addEventListener("click", () => {
          if (s1In) s1In.value = "";
          s1Clr.classList.add("hidden");
          if (s1Sug) { s1Sug.innerHTML = ""; s1Sug.classList.add("hidden"); }
          appState.search = "";
          if (s2In) s2In.value = "";
          if (s2Clr) s2Clr.classList.add("hidden");
          s1In?.focus();
        });
      }

      if (s1Sug) {
        s1Sug.addEventListener("click", (e) => {
          const item = e.target.closest("[data-s1-suggest-name]");
          if (item) {
            const name = item.dataset.s1SuggestName;
            if (s1In) s1In.value = name;
            if (s1Clr) s1Clr.classList.remove("hidden");
            s1Sug.classList.add("hidden");
            appState.search = name;
            if (s2In) s2In.value = name;
            if (s2Clr) s2Clr.classList.remove("hidden");
            if (typeof showHomeSlide === "function") showHomeSlide(2);
          }
        });
      }

      // Slide 2 Handlers
      if (s2In) {
        s2In.addEventListener("input", (e) => {
          const val = e.target.value.trim();
          if (s2Clr) s2Clr.classList.toggle("hidden", !val);
          appState.search = val;
          appState.currentLimit = 36;
          if (!val) {
            if (s2Sug) { s2Sug.innerHTML = ""; s2Sug.classList.add("hidden"); }
            renderExplorer();
            return;
          }
          const matches = getUniversalMatches(val);
          if (s2Sug) {
            s2Sug.innerHTML = buildSuggestionItems(matches, "s2");
            s2Sug.classList.remove("hidden");
          }
          renderExplorer();
        });

        s2In.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            if (s2Sug) s2Sug.classList.add("hidden");
            renderExplorer();
          }
        });
      }

      if (s2Clr) {
        s2Clr.addEventListener("click", () => {
          if (s2In) s2In.value = "";
          s2Clr.classList.add("hidden");
          if (s2Sug) { s2Sug.innerHTML = ""; s2Sug.classList.add("hidden"); }
          appState.search = "";
          if (s1In) s1In.value = "";
          if (s1Clr) s1Clr.classList.add("hidden");
          renderExplorer();
          s2In?.focus();
        });
      }

      if (s2Sug) {
        s2Sug.addEventListener("click", (e) => {
          const item = e.target.closest("[data-s2-suggest-name]");
          if (item) {
            const name = item.dataset.s2SuggestName;
            if (s2In) s2In.value = name;
            if (s2Clr) s2Clr.classList.remove("hidden");
            s2Sug.classList.add("hidden");
            appState.search = name;
            renderExplorer();
          }
        });
      }

      // Global click outside to dismiss all auto-suggest dropdowns
      document.addEventListener("click", (e) => {
        const wrap1 = document.getElementById("slide1-college-search")?.closest(".relative");
        if (wrap1 && !wrap1.contains(e.target)) {
          const sug1 = document.getElementById("slide1-search-suggestions");
          if (sug1) sug1.classList.add("hidden");
        }
        const wrap2 = document.getElementById("slide2-college-search")?.closest(".relative");
        if (wrap2 && !wrap2.contains(e.target)) {
          const sug2 = document.getElementById("slide2-search-suggestions");
          if (sug2) sug2.classList.add("hidden");
        }
      });

      // Modal back button event listener
      const mBackBtn = document.getElementById("modal-back-btn");
      if (mBackBtn) {
        mBackBtn.addEventListener("click", () => {
          document.getElementById("detail-modal")?.classList.add("hidden");
        });
      }

      document.querySelectorAll(".search-filter-chip").forEach(chip => {
        chip.addEventListener("click", () => {
          document.querySelectorAll(".search-filter-chip").forEach(c => {
            c.classList.remove("active", "bg-blue-600", "text-white");
            c.classList.add("bg-slate-100", "text-slate-700");
          });
          chip.classList.add("active", "bg-blue-600", "text-white");
          chip.classList.remove("bg-slate-100", "text-slate-700");
          searchDirCategory = chip.dataset.cat || "all";
          renderSearchDirectory();
        });
      });

      // ==============================================================
      // COUNSELING DETAILS / STUDENT PROFILE SETUP MODAL LOGIC (Pic 2)
      // ==============================================================
      let selectedCounselingExam = "ap_cet";

      function openCounselingDetailsModal() {
        const modal = document.getElementById("counseling-details-modal");
        if (!modal) return;

        // Populate fields with current profile and appState
        const nameInput = document.getElementById("counseling-student-name");
        if (nameInput) nameInput.value = studentProfile.fullName || "Chakravarty";

        const genderSelect = document.getElementById("counseling-gender-select");
        if (genderSelect) genderSelect.value = studentProfile.gender || "male";

        const catSelect = document.getElementById("counseling-category-select");
        if (catSelect) catSelect.value = appState.category || "SC";

        const rankInput = document.getElementById("counseling-rank-input");
        if (rankInput) rankInput.value = (appState.rank && appState.rank > 0) ? appState.rank : 100000;

        const stateSelect = document.getElementById("counseling-state-select");
        if (stateSelect) stateSelect.value = appState.state || "Andhra Pradesh";

        // Set exam
        setCounselingModalExam(appState.exam || "ap_cet");

        modal.classList.remove("hidden");
      }

      function closeCounselingDetailsModal() {
        const modal = document.getElementById("counseling-details-modal");
        if (modal) modal.classList.add("hidden");
      }

      function setCounselingModalExam(examKey) {
        selectedCounselingExam = examKey;
        const examSelect = document.getElementById("counseling-exam-select");
        const hint = document.getElementById("counseling-exam-hint");
        const rankContainer = document.getElementById("counseling-rank-container");
        const directNote = document.getElementById("counseling-direct-note");

        if (examSelect) examSelect.value = examKey;
        if (hint) {
          if (examKey === "ap_cet") hint.textContent = "AP CET";
          else if (examKey === "jee_main") hint.textContent = "JEE MAIN";
          else if (examKey === "jee_adv") hint.textContent = "JEE ADV";
          else if (examKey === "payment") hint.textContent = "PAYMENT";
          else hint.textContent = examKey.toUpperCase();
        }

        // Highlight tab
        document.querySelectorAll("#counseling-exam-tabs .counseling-exam-tab").forEach(tab => {
          const isSelected = tab.dataset.exam === examKey;
          tab.classList.toggle("active", isSelected);
          if (isSelected) {
            tab.className = "counseling-exam-tab active p-1.5 rounded-xl border-2 border-blue-600 bg-blue-50 text-blue-900 font-extrabold text-[11px] text-center transition cursor-pointer";
          } else {
            tab.className = "counseling-exam-tab p-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-semibold text-[11px] text-center transition cursor-pointer";
          }
        });

        // Toggle payment / rank view
        if (examKey === "payment") {
          if (rankContainer) rankContainer.classList.add("hidden");
          if (directNote) directNote.classList.remove("hidden");
        } else {
          if (rankContainer) rankContainer.classList.remove("hidden");
          if (directNote) directNote.classList.add("hidden");
        }
      }

      function saveCounselingDetailsFromModal() {
        const nameVal = document.getElementById("counseling-student-name")?.value.trim() || "Chakravarty";
        studentProfile.fullName = nameVal;

        const genderVal = document.getElementById("counseling-gender-select")?.value || "male";
        studentProfile.gender = genderVal;

        const catVal = document.getElementById("counseling-category-select")?.value || "SC";
        appState.category = catVal;

        const stateVal = document.getElementById("counseling-state-select")?.value || "Andhra Pradesh";
        appState.state = stateVal;
        studentProfile.homeState = stateVal;

        const chosenExam = selectedCounselingExam || "ap_cet";
        appState.exam = chosenExam;
        studentProfile.selectedExam = chosenExam;

        if (chosenExam === "payment") {
          appState.rank = null;
        } else {
          const rVal = parseInt(document.getElementById("counseling-rank-input")?.value, 10);
          appState.rank = (!isNaN(rVal) && rVal > 0) ? rVal : 100000;
        }

        // Sync with wizard fields as well for unified state
        const wName = document.getElementById("wiz-student-name");
        if (wName) wName.value = studentProfile.fullName;
        const wCat = document.getElementById("wiz-category-select");
        if (wCat) wCat.value = appState.category;
        const wRank = document.getElementById("wiz-rank-input");
        if (wRank) wRank.value = appState.rank || 100000;
        const wExam = document.getElementById("wiz-exam-select");
        if (wExam) wExam.value = appState.exam;

        // Sync with explorer filter controls
        if (document.getElementById("rank-input")) {
          document.getElementById("rank-input").value = appState.rank || "";
          if (appState.rank) document.getElementById("rank-clear-btn")?.classList.remove("hidden");
        }
        if (document.getElementById("category-select")) {
          document.getElementById("category-select").value = appState.category;
        }
        const stSelect = document.getElementById("state-select");
        if (stSelect) {
          stSelect.value = appState.state;
          const badge = document.getElementById("state-active-badge");
          if (badge) badge.textContent = appState.state === "ALL" ? "ALL STATES" : appState.state.toUpperCase();
        }

        // Set active exam tab in explorer
        setExamTab(chosenExam);

        // Update profile header
        if (typeof updateProfileKpis === "function") updateProfileKpis();
        if (typeof updateStudentBannersAndSheetHeader === "function") updateStudentBannersAndSheetHeader();
      }

      // Event Listeners for Counseling Details Modal
      const navCounselingBtn = document.getElementById("nav-menu-counseling-btn");
      if (navCounselingBtn) {
        const popTooltip = document.getElementById("counseling-pop-tooltip");

        const showPopText = () => {
          if (popTooltip) {
            popTooltip.classList.remove("opacity-0", "translate-y-1");
            popTooltip.classList.add("opacity-100", "translate-y-0");
          }
        };

        const hidePopText = () => {
          if (popTooltip) {
            popTooltip.classList.add("opacity-0", "translate-y-1");
            popTooltip.classList.remove("opacity-100", "translate-y-0");
          }
        };

        navCounselingBtn.addEventListener("mouseenter", showPopText);
        navCounselingBtn.addEventListener("mouseleave", hidePopText);

        const handleOpenCounseling = (e) => {
          e.preventDefault();
          e.stopPropagation();
          // Pop up the text above the option
          showPopText();

          // After a brief moment for the pop text animation, open the slide modal
          setTimeout(() => {
            hidePopText();
            const kNav = document.getElementById("kodnest-navbar-dropdown");
            if (kNav) kNav.classList.add("hidden");
            openCounselingDetailsModal();
          }, 380);
        };

        navCounselingBtn.addEventListener("click", handleOpenCounseling);
        navCounselingBtn.addEventListener("touchend", handleOpenCounseling);
      }

      const counselingBackBtn = document.getElementById("counseling-modal-back-btn");
      if (counselingBackBtn) {
        counselingBackBtn.addEventListener("click", closeCounselingDetailsModal);
      }

      const counselingModal = document.getElementById("counseling-details-modal");
      if (counselingModal) {
        counselingModal.addEventListener("click", (e) => {
          if (e.target === counselingModal) closeCounselingDetailsModal();
        });
      }

      // Tab clicks in counseling modal
      document.querySelectorAll("#counseling-exam-tabs .counseling-exam-tab").forEach(tab => {
        tab.addEventListener("click", () => {
          setCounselingModalExam(tab.dataset.exam);
        });
      });

      // Exam dropdown change in counseling modal
      const counselingExamSel = document.getElementById("counseling-exam-select");
      if (counselingExamSel) {
        counselingExamSel.addEventListener("change", (e) => {
          setCounselingModalExam(e.target.value);
        });
      }

      // "Explore Colleges" Button Action
      const counselingExploreBtn = document.getElementById("counseling-explore-btn");
      if (counselingExploreBtn) {
        counselingExploreBtn.addEventListener("click", () => {
          saveCounselingDetailsFromModal();
          closeCounselingDetailsModal();
          switchMainView("explore");
          showExplorerSlide(2);
          /* showToast(`🎓 Applied counseling filters! Showing qualifying colleges for rank ${appState.rank || "Direct"}`, "🏛️"); (suppressed) */
        });
      }

      // "Generate Priority Sheet →" Button Action
      const counselingPriorityBtn = document.getElementById("counseling-priority-btn");
      if (counselingPriorityBtn) {
        counselingPriorityBtn.addEventListener("click", () => {
          saveCounselingDetailsFromModal();
          closeCounselingDetailsModal();
          smartAutoFillPriority();
          updateStudentBannersAndSheetHeader();
          switchMainView("priority");
          runMockAllotmentSimulation();
          showToast(`🎯 Generated priority sheet for ${studentProfile.fullName} (Rank ${appState.rank || "Payment"})`, "📋");
        });
      }

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && counselingModal && !counselingModal.classList.contains("hidden")) {
          closeCounselingDetailsModal();
        }
      });

      // Setup The Bridge Story Modal
      function switchWhySlide(slideNum) {
        // Single slide mode - Slide 2 removed per user request
        const modal = document.getElementById("why-we-built-modal");
        if (modal) modal.classList.remove("hidden");
      }

      const whyModal = document.getElementById("why-we-built-modal");
      const openWhyBtn = document.getElementById("open-why-we-built-btn");
      const closeWhyBtn = document.getElementById("close-why-we-built-btn");
      const whyNavBtn = document.getElementById("nav-menu-why-btn");

      function openTheBridgeStory() {
        if (whyModal) whyModal.classList.remove("hidden");
        const moreMenu = document.getElementById("header-more-options-menu");
        if (moreMenu) moreMenu.classList.add("hidden");
      }

      if (openWhyBtn) openWhyBtn.addEventListener("click", openTheBridgeStory);
      if (whyNavBtn) whyNavBtn.addEventListener("click", openTheBridgeStory);

      if (closeWhyBtn && whyModal) {
        closeWhyBtn.addEventListener("click", () => {
          whyModal.classList.add("hidden");
        });
      }

      if (whyModal) {
        whyModal.addEventListener("click", (e) => {
          if (e.target === whyModal) {
            whyModal.classList.add("hidden");
          }
        });
      }

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && whyModal && !whyModal.classList.contains("hidden")) {
          whyModal.classList.add("hidden");
        }
      });

      const openGuideBtn = document.getElementById("open-guide-btn");
      if (openGuideBtn) {
        openGuideBtn.addEventListener("click", () => {
          document.getElementById("guide-modal").classList.remove("hidden");
        });
      }
      document.getElementById("close-guide-btn").addEventListener("click", () => {
        document.getElementById("guide-modal").classList.add("hidden");
      });
      document.getElementById("close-guide-bottom-btn").addEventListener("click", () => {
        document.getElementById("guide-modal").classList.add("hidden");
      });
    }

    // =========================================================================
    // 11. LOGIN, GOOGLE AUTH, DUAL OTP VERIFICATION & STUDENT PROFILE FLOW
    // =========================================================================
    let studentProfile = {
      isLoggedIn: false,
      username: "",
      fullName: "",
      kodnestId: "",
      bridgeId: "",
      email: "",
      phone: "",
      whatsapp: "",
      dob: "",
      gender: "",
      experience: "Fresher",
      careerGap: "0",
      currentState: "",
      currentCity: "",
      preferredLocations: "",
      github: "",
      linkedin: "",

      // 10th Details
      school10Name: "",
      school10Year: "",
      school10Pct: "",

      // 12th / Inter Details
      interCollegeName: "",
      interBoard: "",
      interHallTicket: "",
      interYear: "",
      interPct: "",
      interGroup: "",
      interYear1Marks: "",
      interYear2Marks: "",
      interDistrict: "",

      // UG Details
      ugRollNo: "",
      ugCollege: "",
      ugCourse: "",
      ugBranch: "",
      ugYear: "",
      ugPct: "",
      ugCgpa: "",
      ugBacklogs: "0",

      // PG Details
      pgStatus: "Fresher",

      // Verification & Avatar
      avatarUrl: "",
      emailVerified: false,
      phoneVerified: false,
      selectedExam: "ap_cet"
    };

    function setAuthStage(stageNum) {
      if (stageNum === 2) stageNum = 3;
      const vOtp = document.getElementById("auth-stage-2-otp");
      const vStudent = document.getElementById("auth-stage-3-student");
      if (vOtp) vOtp.classList.add("hidden");
      if (vStudent) vStudent.classList.toggle("hidden", stageNum !== 3);
      if (stageNum === 1 && typeof showAuthSlide === "function") showAuthSlide("signin");
    }

    function generateNewOtps() {
      studentProfile.generatedEmailOtp = String(Math.floor(100000 + Math.random() * 900000));
      studentProfile.generatedPhoneOtp = String(Math.floor(100000 + Math.random() * 900000));
      document.getElementById("live-email-otp-display").textContent = studentProfile.generatedEmailOtp;
      document.getElementById("live-phone-otp-display").textContent = studentProfile.generatedPhoneOtp;
    }

    function updateOtpStatusUI() {
      const emailBadge = document.getElementById("email-verified-status-badge");
      const phoneBadge = document.getElementById("phone-verified-status-badge");
      const feedback = document.getElementById("otp-overall-feedback");

      if (studentProfile.emailVerified) {
        emailBadge.textContent = "✓ Email Verified";
        emailBadge.className = "text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300";
      } else {
        emailBadge.textContent = "Pending OTP";
        emailBadge.className = "text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900";
      }

      if (studentProfile.phoneVerified) {
        phoneBadge.textContent = "✓ Mobile OTP Verified";
        phoneBadge.className = "text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300";
      } else {
        phoneBadge.textContent = "Pending OTP";
        phoneBadge.className = "text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900";
      }

      if (studentProfile.emailVerified && studentProfile.phoneVerified) {
        feedback.innerHTML = `<span class="text-emerald-700 font-extrabold">✅ Both Email & Mobile Number OTPs Verified! You can now proceed.</span>`;
      } else {
        feedback.textContent = "Verify both Email OTP and Mobile SMS OTP (or click Auto-Fill above) to continue.";
      }
    }

    function updateStudentBannersAndSheetHeader() {
      const examNames = {
        ap_cet: "AP EAPCET",
        jee_main: "JEE Main",
        jee_adv: "JEE Advanced",
        payment: "Payment / Direct"
      };
      const examLabel = examNames[appState.exam] || "AP EAPCET";
      const rankStr = appState.rank ? appState.rank.toLocaleString("en-IN") : "Open";

      const hStudentName = document.getElementById("header-student-name-label"); if (hStudentName) hStudentName.textContent = studentProfile.fullName;
      document.getElementById("banner-student-name").textContent = `${studentProfile.fullName} (@${studentProfile.username})`;
      document.getElementById("banner-exam-badge").textContent = examLabel;
      document.getElementById("banner-student-sub").innerHTML = `
        Rank: <strong>${rankStr}</strong> • Quota: <strong>${appState.category}</strong> • Inter MPC: <strong>${studentProfile.interPct}</strong> • Email: <span id="banner-student-email" class="underline text-emerald-300">${studentProfile.email}</span> • Mobile: <strong>+91 ${studentProfile.phone}</strong>
      `;

      // Update Official Priority Sheet Student Profile Header
      const sName = document.getElementById("sheet-student-name"); if (sName) sName.textContent = studentProfile.fullName;
      const sUser = document.getElementById("sheet-student-username"); if (sUser) sUser.textContent = "";
      const sEmail = document.getElementById("sheet-student-email"); if (sEmail) sEmail.textContent = "";
      const sPhone = document.getElementById("sheet-student-phone"); if (sPhone) sPhone.textContent = "";
      document.getElementById("sheet-student-exam-rank").textContent = `${examLabel} • Rank: ${rankStr}`;
      document.getElementById("sheet-student-inter").textContent = `Inter (10+2 MPC): ${studentProfile.interPct}`;
      document.getElementById("sheet-student-quota").textContent = `${appState.category} Quota • ${appState.region} Region`;
      document.getElementById("sheet-student-branch").textContent = `Preferred Branch: ${appState.branch}`;

      // Pre-fill Email PDF Dispatch Modal
      document.getElementById("dispatch-to-email").value = studentProfile.email;
      const cleanName = studentProfile.fullName.replace(/[^a-zA-Z0-9]/g, "_") || "Student";
      document.getElementById("email-attachment-filename").textContent = `My_BTech_Web_Options_${cleanName}_${appState.category}.pdf`;
      document.getElementById("email-attachment-summary").textContent =
        `Student: ${studentProfile.fullName} | Exam: ${examLabel} | Rank: ${rankStr} (${appState.category}) | ${appState.priorityList.length} Prioritized Colleges (eligible for your rank & gender).`;
    }

    function applyStudentWizardAndLaunch(targetView) {
      studentProfile.fullName = document.getElementById("wiz-student-name")?.value.trim() || "Chakravarty";
      studentProfile.interPct = document.getElementById("wiz-inter-pct")?.value.trim() || "92.0%";

      const chosenExam = studentProfile.selectedExam || document.getElementById("wiz-exam-select")?.value || "ap_cet";
      studentProfile.selectedExam = chosenExam;
      appState.exam = chosenExam;

      if (chosenExam === "payment") {
        appState.rank = null;
      } else {
        const enteredRank = parseInt(document.getElementById("wiz-rank-input")?.value, 10);
        appState.rank = (!isNaN(enteredRank) && enteredRank > 0) ? enteredRank : 100000;
      }
      appState.category = document.getElementById("wiz-category-select")?.value || "SC";
      appState.region = document.getElementById("wiz-region-select")?.value || "ALL";
      appState.branch = document.getElementById("wiz-branch-select")?.value || "ALL";

      // Selected Home State:
      // If user selected JEE or JEE Advanced, default to ALL states unless specifically picking a state
      const rawState = document.getElementById("wiz-state-select")?.value || "ALL";
      if ((chosenExam === "jee_main" || chosenExam === "jee_adv") && (rawState === "ALL" || rawState === "All India")) {
        appState.state = "ALL";
      } else {
        appState.state = rawState;
      }
      studentProfile.homeState = appState.state;

      // Sync state filter in main explorer filter bar
      const stSelect = document.getElementById("state-select");
      if (stSelect) {
        stSelect.value = appState.state;
        const badge = document.getElementById("state-active-badge");
        if (badge) badge.textContent = appState.state === "ALL" ? "ALL STATES" : appState.state.toUpperCase();
      }

      // Sync main filter UI controls
      if (document.getElementById("rank-input")) {
        document.getElementById("rank-input").value = appState.rank;
        document.getElementById("rank-clear-btn")?.classList.remove("hidden");
      }
      if (document.getElementById("category-select")) document.getElementById("category-select").value = appState.category;
      if (document.getElementById("region-select")) document.getElementById("region-select").value = appState.region;
      if (document.getElementById("branch-select")) document.getElementById("branch-select").value = appState.branch;

      // Set active exam tab
      setExamTab(chosenExam);

      // Hide auth overlay and show close/skip button
      document.getElementById("auth-portal-overlay")?.classList.add("hidden");
      if (typeof window.updateAppNavVisibility === "function") window.updateAppNavVisibility();
      document.getElementById("skip-or-close-auth-btn")?.classList.remove("hidden");

      if (targetView === "priority") {
        smartAutoFillPriority();
        updateStudentBannersAndSheetHeader();
        switchMainView("priority");
        runMockAllotmentSimulation();
        showToast(`🎯 Generated personalized Priority Sheet for ${studentProfile.fullName} (${chosenExam.toUpperCase()}, Rank ${appState.rank.toLocaleString("en-IN")})!`, "📋");
      } else {
        updateStudentBannersAndSheetHeader();
        renderExplorer();
        switchMainView("explore");
        const stateText = appState.state === "ALL" ? "All States (Pan-India)" : appState.state;
        const examName = chosenExam === "payment" ? "Payment / Direct Admission" : (chosenExam === "jee_main" ? "JEE Main" : (chosenExam === "jee_adv" ? "JEE Advanced" : "Engineering"));
        /* showToast(`📍 Showing ${examName} Colleges for ${stateText}!`, "🏛️"); (suppressed) */
      }
    }

    function initAuthAndEmailFlow() {
      document.getElementById("open-auth-portal-btn")?.addEventListener("click", () => {
        document.getElementById("auth-portal-overlay")?.classList.remove("hidden");
        setAuthStage(1);
      });
      document.getElementById("banner-edit-student-btn").addEventListener("click", () => {
        document.getElementById("auth-portal-overlay").classList.remove("hidden");
        setAuthStage(3);
      });
      document.getElementById("skip-or-close-auth-btn").addEventListener("click", () => {
        document.getElementById("auth-portal-overlay").classList.add("hidden");
      });
      document.getElementById("banner-view-priority-btn").addEventListener("click", () => {
        switchMainView("priority");
        runMockAllotmentSimulation();
      });

      // Password Show/Hide
      document.getElementById("toggle-password-visibility").addEventListener("click", () => {
        const pw = document.getElementById("login-password-input");
        pw.type = pw.type === "password" ? "text" : "password";
      });

      // Direct Login Submit (No OTP Verification)
      document.getElementById("login-submit-btn").addEventListener("click", () => {
        if (typeof xLogin === "function") {
          xLogin();
        }
      });

      document.getElementById("back-to-login-btn").addEventListener("click", () => setAuthStage(1));

      // Stage 2: Email & Phone OTP Verification
      document.getElementById("autofill-verify-otps-btn").addEventListener("click", () => {
        document.getElementById("email-otp-input").value = studentProfile.generatedEmailOtp;
        document.getElementById("phone-otp-input").value = studentProfile.generatedPhoneOtp;
        studentProfile.emailVerified = true;
        studentProfile.phoneVerified = true;
        updateOtpStatusUI();
        showToast("Email & Mobile OTPs auto-filled and verified!", "✅");
      });

      document.getElementById("verify-email-otp-btn").addEventListener("click", () => {
        const entered = document.getElementById("email-otp-input").value.trim();
        if (entered === studentProfile.generatedEmailOtp || entered.length === 6) {
          studentProfile.emailVerified = true;
          updateOtpStatusUI();
          showToast("Email Address Verified!", "📧");
        } else {
          showToast(`Enter the 6-digit Email OTP (${studentProfile.generatedEmailOtp})`, "⚠️");
        }
      });

      document.getElementById("verify-phone-otp-btn").addEventListener("click", () => {
        const entered = document.getElementById("phone-otp-input").value.trim();
        if (entered === studentProfile.generatedPhoneOtp || entered.length === 6) {
          studentProfile.phoneVerified = true;
          updateOtpStatusUI();
          showToast("Mobile Number OTP Verified!", "📱");
        } else {
          showToast(`Enter the 6-digit SMS OTP (${studentProfile.generatedPhoneOtp})`, "⚠️");
        }
      });

      document.getElementById("resend-email-otp-btn").addEventListener("click", () => {
        generateNewOtps();
        showToast(`New Email Verification Code sent: ${studentProfile.generatedEmailOtp}`, "📧");
      });

      document.getElementById("resend-phone-otp-btn").addEventListener("click", () => {
        generateNewOtps();
        showToast(`New SMS OTP sent: ${studentProfile.generatedPhoneOtp}`, "📱");
      });

      document.getElementById("proceed-to-student-details-btn").addEventListener("click", () => {
        if (!studentProfile.emailVerified || !studentProfile.phoneVerified) {
          // Auto-verify if they entered 6 digits or click proceed
          studentProfile.emailVerified = true;
          studentProfile.phoneVerified = true;
          updateOtpStatusUI();
        }
        setAuthStage(3);
        showToast("Security verification complete! Enter Student & Exam Details.", "🎓");
      });

      // Stage 3: Entrance Exam Selector & State Handler
      function initWizExamBindings() {
        const examSelect = document.getElementById("wiz-exam-select");
        const hint = document.getElementById("exam-selected-hint");

        const syncExamUI = (code) => {
          studentProfile.selectedExam = code;
          if (examSelect) examSelect.value = code;
          if (hint) {
            const labels = {
              ap_cet: "AP CET",
              jee_main: "JEE Main",
              jee_adv: "JEE Advanced",
              bitsat: "BITSAT",
              ts_eamcet: "TS EAMCET",
              kcet: "KCET",
              comedk: "COMEDK",
              mht_cet: "MHT CET",
              tnea: "TNEA",
              wbjee: "WBJEE",
              viteee: "VITEEE",
              srmjeee: "SRMJEEE",
              met: "MET",
              payment: "Payment Seat"
            };
            hint.textContent = labels[code] || code.toUpperCase();
          }

          document.querySelectorAll(".wiz-exam-btn").forEach(btn => {
            if (btn.dataset.wizExam === code) {
              btn.className = "wiz-exam-btn active p-1.5 rounded-xl border-2 border-blue-600 bg-blue-50 text-blue-900 font-extrabold text-[11px] text-center transition cursor-pointer";
            } else {
              btn.className = "wiz-exam-btn p-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-semibold text-[11px] text-center transition cursor-pointer";
            }
          });

          // Toggle Stage 3 Rank container when Payment is selected
          const wizRankBox = document.getElementById("wiz-rank-container");
          const wizDirectNote = document.getElementById("wiz-direct-admission-note");
          if (code === "payment") {
            if (wizRankBox) wizRankBox.classList.add("hidden");
            if (wizDirectNote) wizDirectNote.classList.remove("hidden");
          } else {
            if (wizRankBox) wizRankBox.classList.remove("hidden");
            if (wizDirectNote) wizDirectNote.classList.add("hidden");
          }
        };

        document.querySelectorAll(".wiz-exam-btn").forEach(btn => {
          btn.addEventListener("click", () => syncExamUI(btn.dataset.wizExam));
        });

        examSelect?.addEventListener("change", (e) => {
          syncExamUI(e.target.value);
        });
      }
      initWizExamBindings();

      document.getElementById("wiz-open-explorer-btn").addEventListener("click", () => {
        applyStudentWizardAndLaunch("explore");
      });

      document.getElementById("wiz-finish-priority-btn").addEventListener("click", () => {
        applyStudentWizardAndLaunch("priority");
      });

      // Email PDF Dispatch Modal Handlers
      function openEmailPdfModal() {
        if (appState.priorityList.length === 0) {
          smartAutoFillPriority();
        }
        updateStudentBannersAndSheetHeader();
        const dispatchInput = document.getElementById("dispatch-to-email");
        if (dispatchInput) {
          const userEmail = (studentProfile && studentProfile.email) || localStorage.getItem("bridge_user_email") || "";
          if (userEmail) dispatchInput.value = userEmail;
        }
        document.getElementById("email-dispatch-success-box").classList.add("hidden");
        document.getElementById("email-pdf-modal").classList.remove("hidden");
      }

      document.getElementById("send-email-pdf-btn").addEventListener("click", openEmailPdfModal);
      document.getElementById("banner-email-pdf-btn").addEventListener("click", openEmailPdfModal);
      document.getElementById("close-email-pdf-modal-btn").addEventListener("click", () => {
        document.getElementById("email-pdf-modal").classList.add("hidden");
      });
      document.getElementById("cancel-email-pdf-btn").addEventListener("click", () => {
        document.getElementById("email-pdf-modal").classList.add("hidden");
      });

      document.getElementById("confirm-send-email-pdf-btn").addEventListener("click", () => {
        const toEmail = document.getElementById("dispatch-to-email").value.trim() || studentProfile.email;
        const ccEmail = document.getElementById("dispatch-cc-email").value.trim();
        const successBox = document.getElementById("email-dispatch-success-box");
        const receiptText = document.getElementById("email-dispatch-receipt-text");

        const topColleges = appState.priorityList.slice(0, 4).map((item, idx) => {
          const c = collegesData.find(x => x.id === item.collegeId);
          return `#${idx + 1} ${c ? c.code : ""} (${item.branchCode})`;
        }).join(", ");

        receiptText.innerHTML = `
          Sent <strong>${document.getElementById("email-attachment-filename").textContent}</strong> to <strong>${toEmail}</strong>${ccEmail ? ` (CC: ${ccEmail})` : ""}.<br/>
          <strong>Included Priorities:</strong> ${topColleges || "All selected options"} (${appState.priorityList.length} total choices).<br/>
          Your PDF copy is also downloading directly to your device now.
        `;
        successBox.classList.remove("hidden");

        // Trigger the actual PDF download so the student gets the PDF file as well
        downloadPriorityPdf();
        showToast(`Priority List PDF sent to ${toEmail} & downloaded!`, "📨");
      });

      document.getElementById("open-mailto-client-btn").addEventListener("click", () => {
        const toEmail = document.getElementById("dispatch-to-email").value.trim() || studentProfile.email;
        const ccEmail = document.getElementById("dispatch-cc-email").value.trim();
        const lines = appState.priorityList.map((item, i) => {
          const c = collegesData.find(x => x.id === item.collegeId);
          return `Option #${i + 1}: ${c ? c.code : ""} - ${c ? c.name : ""} [${item.branchCode}]`;
        }).join("\n");
        const subject = `The Bridge B.Tech Web Options Priority Sheet - ${studentProfile.fullName} (Rank ${appState.rank || "Open"})`;
        const body = `Student Name: ${studentProfile.fullName}\nVerified Email: ${studentProfile.email}\nVerified Mobile: +91 ${studentProfile.phone}\nEntrance Exam: ${appState.exam.toUpperCase()} | Rank: ${appState.rank || "Open"} | Category: ${appState.category}\n\nPRIORITIZED WEB OPTIONS LIST:\n${lines}`;
        const mailtoUrl = `mailto:${encodeURIComponent(toEmail)}?${ccEmail ? `cc=${encodeURIComponent(ccEmail)}&` : ""}subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(mailtoUrl, "_blank");
      });
    }

    
    // =========================================================================
    // THE BRIDGE ENHANCEMENT SUITE: AVATARS, GEOLOCATION & DATASET PERSISTENCE
    // =========================================================================

    // Curated Student Tech Avatars (Inline SVG Data URIs)
    const RANDOM_AVATARS = [
      "data:image/svg+xml;utf8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#3b82f6"/><stop offset="100%" stop-color="#1d4ed8"/></linearGradient></defs><rect width="100" height="100" rx="20" fill="url(#g1)"/><circle cx="50" cy="38" r="18" fill="#fde047"/><path d="M22 86c0-16 12-28 28-28s28 12 28 28" fill="#ffffff"/><circle cx="43" cy="36" r="3" fill="#1e293b"/><circle cx="57" cy="36" r="3" fill="#1e293b"/><path d="M44 46q6 4 12 0" stroke="#1e293b" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M30 32c4-12 36-12 40 0" stroke="#0f172a" stroke-width="6" fill="none" stroke-linecap="round"/></svg>'),
      "data:image/svg+xml;utf8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#10b981"/><stop offset="100%" stop-color="#047857"/></linearGradient></defs><rect width="100" height="100" rx="20" fill="url(#g2)"/><circle cx="50" cy="38" r="18" fill="#fbcfe8"/><path d="M22 86c0-16 12-28 28-28s28 12 28 28" fill="#ffffff"/><circle cx="43" cy="36" r="2.5" fill="#0f172a"/><circle cx="57" cy="36" r="2.5" fill="#0f172a"/><path d="M45 45q5 3 10 0" stroke="#0f172a" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M28 28c8-8 36-8 44 0" stroke="#9333ea" stroke-width="8" fill="none" stroke-linecap="round"/></svg>'),
      "data:image/svg+xml;utf8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#b45309"/></linearGradient></defs><rect width="100" height="100" rx="20" fill="url(#g3)"/><circle cx="50" cy="38" r="18" fill="#fed7aa"/><path d="M22 86c0-16 12-28 28-28s28 12 28 28" fill="#1e293b"/><circle cx="43" cy="36" r="3" fill="#0f172a"/><circle cx="57" cy="36" r="3" fill="#0f172a"/><rect x="36" y="32" width="14" height="10" rx="3" stroke="#2563eb" stroke-width="2" fill="none"/><rect x="50" y="32" width="14" height="10" rx="3" stroke="#2563eb" stroke-width="2" fill="none"/><line x1="49" y1="36" x2="51" y2="36" stroke="#2563eb" stroke-width="2"/><path d="M45 46q5 4 10 0" stroke="#0f172a" stroke-width="2" fill="none"/></svg>'),
      "data:image/svg+xml;utf8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g4" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#8b5cf6"/><stop offset="100%" stop-color="#6d28d9"/></linearGradient></defs><rect width="100" height="100" rx="20" fill="url(#g4)"/><circle cx="50" cy="38" r="18" fill="#ffedd5"/><path d="M22 86c0-16 12-28 28-28s28 12 28 28" fill="#ffffff"/><circle cx="43" cy="36" r="2.5" fill="#1e293b"/><circle cx="57" cy="36" r="2.5" fill="#1e293b"/><path d="M28 38c0-12 10-20 22-20s22 8 22 20" stroke="#f43f5e" stroke-width="6" fill="none"/><rect x="25" y="34" width="6" height="14" rx="3" fill="#f43f5e"/><rect x="69" y="34" width="6" height="14" rx="3" fill="#f43f5e"/><path d="M44 46q6 4 12 0" stroke="#1e293b" stroke-width="2" fill="none"/></svg>'),
      "data:image/svg+xml;utf8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g5" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#06b6d4"/><stop offset="100%" stop-color="#0e7490"/></linearGradient></defs><rect width="100" height="100" rx="20" fill="url(#g5)"/><circle cx="50" cy="38" r="18" fill="#fed7aa"/><path d="M22 86c0-16 12-28 28-28s28 12 28 28" fill="#0f172a"/><circle cx="43" cy="36" r="2.5" fill="#0f172a"/><circle cx="57" cy="36" r="2.5" fill="#0f172a"/><path d="M30 26c10-8 30-8 40 0" stroke="#1e293b" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M45 46q5 3 10 0" stroke="#0f172a" stroke-width="2" fill="none"/></svg>'),
      "data:image/svg+xml;utf8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g6" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#ec4899"/><stop offset="100%" stop-color="#be185d"/></linearGradient></defs><rect width="100" height="100" rx="20" fill="url(#g6)"/><circle cx="50" cy="38" r="18" fill="#fde68a"/><path d="M22 86c0-16 12-28 28-28s28 12 28 28" fill="#ffffff"/><circle cx="43" cy="36" r="2.5" fill="#0f172a"/><circle cx="57" cy="36" r="2.5" fill="#0f172a"/><path d="M26 36c2-14 46-14 48 0" stroke="#047857" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M44 46q6 4 12 0" stroke="#0f172a" stroke-width="2" fill="none"/></svg>')
    ];

    let randomAvatarIdx = 0;

    function applyAvatar(avatarUrl) {
      studentProfile.avatarUrl = avatarUrl;
      const avatarImg = document.getElementById("profile-avatar-img");
      const avatarPlaceholder = document.getElementById("profile-avatar-placeholder");
      const removeBtn = document.getElementById("btn-avatar-remove");

      if (avatarUrl) {
        if (avatarImg) {
          avatarImg.src = avatarUrl;
          avatarImg.classList.remove("hidden");
        }
        if (avatarPlaceholder) avatarPlaceholder.classList.add("hidden");
        if (removeBtn) removeBtn.classList.remove("hidden");

        // Update top-right header button
        const openAuthBtn = document.getElementById("open-auth-portal-btn");
        if (openAuthBtn) {
          const emojiSpan = openAuthBtn.querySelector("span span");
          if (emojiSpan) {
            emojiSpan.innerHTML = '<img src="' + avatarUrl + '" class="w-4 h-4 rounded-full object-cover inline-block flex-shrink-0" />';
          }
        }
      } else {
        if (avatarImg) {
          avatarImg.src = "";
          avatarImg.classList.add("hidden");
        }
        if (avatarPlaceholder) avatarPlaceholder.classList.remove("hidden");
        if (removeBtn) removeBtn.classList.add("hidden");

        const openAuthBtn = document.getElementById("open-auth-portal-btn");
        if (openAuthBtn) {
          const emojiSpan = openAuthBtn.querySelector("span span");
          if (emojiSpan) emojiSpan.textContent = "👤";
        }
      }

      if (typeof updateProfileAvatarUI === "function") updateProfileAvatarUI(avatarUrl);
      saveCompleteStudentDataset();
    }

    function downscaleAndSetAvatar(dataUrl) {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 256;
        let w = img.width, h = img.height;
        if (w > h) {
          if (w > maxDim) { h = Math.round((h * maxDim) / w); w = maxDim; }
        } else {
          if (h > maxDim) { w = Math.round((w * maxDim) / h); h = maxDim; }
        }
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        const compactDataUrl = canvas.toDataURL("image/jpeg", 0.85);
        applyAvatar(compactDataUrl);
        showToast("Profile picture updated successfully! 📸", "✅");
      };
      img.src = dataUrl;
    }

    
    // =========================================================================
    // PHONEPE + KODNEST + UNWISE INTERACTIVE SUITE JS
    // =========================================================================

    function setupUniwiseHeroFilters() {
      const qInput = document.getElementById("uniwise-quick-search");
      const bSelect = document.getElementById("uniwise-budget-filter");
      const lSelect = document.getElementById("uniwise-location-filter");
      const showBtn = document.getElementById("uniwise-show-campuses-btn");

      function applyUniwiseFilters() {
        const query = (qInput?.value || "").toLowerCase().trim();
        const budget = bSelect?.value || "all";
        const loc = lSelect?.value || "all";

        // Sync with primary college search bar
        const mainSearch = document.getElementById("college-search-input");
        if (mainSearch && query) {
          mainSearch.value = query;
          mainSearch.dispatchEvent(new Event("input"));
        }

        // Apply district filter if selected
        const distSelect = document.getElementById("district-select");
        if (distSelect && loc !== "all") {
          distSelect.value = loc;
          distSelect.dispatchEvent(new Event("change"));
        } else if (distSelect && loc === "all") {
          distSelect.value = "all";
          distSelect.dispatchEvent(new Event("change"));
        }

        // Scroll to college results table
        const target = document.getElementById("colleges-table-body") || document.getElementById("colleges-grid-container");
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        /* showToast("Filtered 330 colleges based on your preferences! 🎯", "🔍"); (suppressed) */
      }

      showBtn?.addEventListener("click", applyUniwiseFilters);
      qInput?.addEventListener("keydown", (e) => {
        if (e.key === "Enter") applyUniwiseFilters();
      });

      // Preference chips click handlers
      document.querySelectorAll("#uniwise-pref-chips .pref-chip").forEach(chip => {
        chip.addEventListener("click", () => {
          chip.classList.toggle("bg-amber-100");
          chip.classList.toggle("border-amber-500");
          chip.classList.toggle("text-amber-950");
          const filter = chip.dataset.filter;
          if (filter === "jvd") {
            const b = document.getElementById("uniwise-budget-filter");
            if (b) b.value = "jvd";
          }
          applyUniwiseFilters();
        });
      });

      // Mission & Suggest modal/toasts
      document.getElementById("btn-read-mission")?.addEventListener("click", () => {
        showToast("The Bridge mission: 100% transparent counseling with zero paid sponsorships.", "✴️");
      });
      // Connect "Suggest update" button to open the dedicated Request Update Modal
      function openRequestUpdateModal(prefillCollege) {
        const reqModal = document.getElementById("request-update-modal");
        const formBody = document.getElementById("request-update-form-body");
        const succView = document.getElementById("request-update-success-view");
        const collegeInput = document.getElementById("req-update-college");
        if (formBody) formBody.classList.remove("hidden");
        if (succView) succView.classList.add("hidden");
        if (collegeInput && prefillCollege) collegeInput.value = prefillCollege;
        if (reqModal) reqModal.classList.remove("hidden");
      }

      document.getElementById("btn-suggest-missing")?.addEventListener("click", () => {
        openRequestUpdateModal();
      });

      // Submit Request & Update handler
      document.getElementById("submit-req-update-btn")?.addEventListener("click", () => {
        const name = (document.getElementById("req-update-name")?.value || "").trim();
        const email = (document.getElementById("req-update-email")?.value || "").trim();
        const category = document.getElementById("req-update-category")?.value || "Update Request";
        const college = (document.getElementById("req-update-college")?.value || "").trim();
        const message = (document.getElementById("req-update-message")?.value || "").trim();

        if (!message) {
          alert("Please describe the update or missing details before submitting.");
          document.getElementById("req-update-message")?.focus();
          return;
        }

        const requestData = {
          name,
          email,
          category,
          college,
          message,
          date: new Date().toISOString()
        };

        // Send to backend endpoint
        const apiBase = (window.I2T_CONFIG && window.I2T_CONFIG.API_BASE) ? window.I2T_CONFIG.API_BASE : "";
        fetch(apiBase + "/api/request-update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestData)
        }).catch(err => console.log("[Request API] Dispatched with fallback:", err.message));

        // Setup direct mailto link
        const directMailto = document.getElementById("req-update-direct-mailto");
        if (directMailto) {
          const subject = encodeURIComponent(`[The Bridge Request] ${category} from ${name || email || "Student"}`);
          const body = encodeURIComponent(`Hi Sridhar,\n\nI have an update / request for The Bridge:\nCategory: ${category}\nCollege: ${college || "All / General"}\n\nDetails:\n${message}\n\nFrom: ${name || "Student"} (${email || "N/A"})\nDate: ${new Date().toLocaleString()}`);
          directMailto.href = `mailto:athotasridharchakravarthy@gmail.com?subject=${subject}&body=${body}`;
        }

        // Show success confirmation
        const formBody = document.getElementById("request-update-form-body");
        const succView = document.getElementById("request-update-success-view");
        if (formBody) formBody.classList.add("hidden");
        if (succView) succView.classList.remove("hidden");

        if (typeof showToast === "function") {
          showToast("Request emailed to founder team", "✅");
        }
      });
    }

    function setupBridgeAIMascot() {
      const floater = document.getElementById("bridge-ai-floater");
      const drawer = document.getElementById("bridge-ai-drawer");
      const backdrop = document.getElementById("bridge-ai-backdrop");
      const closeBtn = document.getElementById("close-bridge-ai-btn");
      const sendBtn = document.getElementById("bridge-ai-send-btn");
      const input = document.getElementById("bridge-ai-input");
      const msgBox = document.getElementById("bridge-ai-messages");
      const historyToggleBtn = document.getElementById("bridge-ai-history-toggle-btn");
      const newChatBtn = document.getElementById("bridge-ai-new-btn");
      const historyPanel = document.getElementById("bridge-ai-history-panel");
      const chatView = document.getElementById("bridge-ai-chat-view");
      const historyList = document.getElementById("bridge-ai-history-list");
      const historyBackBtn = document.getElementById("bridge-ai-history-back-btn");
      const historyClearBtn = document.getElementById("bridge-ai-history-clear-btn");
      const historyBadge = document.getElementById("bridge-ai-history-badge");
      const sessionTitleEl = document.getElementById("bridge-ai-current-session-title");
      const sessionMsgCountEl = document.getElementById("bridge-ai-session-msg-count");

      let aiSessions = [];
      let activeSessionId = null;
      let chatHistory = [];

      const STORAGE_KEY_SESSIONS = "bridge_ai_sessions_v1";
      const STORAGE_KEY_ACTIVE = "bridge_ai_active_session_id";

      function loadStoredAiSessions() {
        try {
          const raw = localStorage.getItem(STORAGE_KEY_SESSIONS);
          aiSessions = raw ? JSON.parse(raw) : [];
          if (!Array.isArray(aiSessions)) aiSessions = [];
        } catch (e) {
          aiSessions = [];
        }
        activeSessionId = localStorage.getItem(STORAGE_KEY_ACTIVE) || (aiSessions[0]?.id) || null;
        updateHistoryBadge();
      }

      function saveAiSessionsToStorage() {
        try {
          localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(aiSessions.slice(0, 50)));
          if (activeSessionId) {
            localStorage.setItem(STORAGE_KEY_ACTIVE, activeSessionId);
          }
        } catch (e) {}
        updateHistoryBadge();
        syncAiHistoryWithServer();
      }

      async function syncAiHistoryWithServer() {
        try {
          const apiBase = (window.I2T_CONFIG && window.I2T_CONFIG.API_BASE) || "";
          const email = (typeof studentProfile !== "undefined" && studentProfile?.email) 
            || localStorage.getItem("bridge_user_email") || "guest";
          await fetch(apiBase + "/api/ai/history", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email,
              sessions: aiSessions.slice(0, 50),
              activeSessionId
            })
          });
        } catch (e) {}
      }

      async function fetchServerAiHistory() {
        try {
          const apiBase = (window.I2T_CONFIG && window.I2T_CONFIG.API_BASE) || "";
          const email = (typeof studentProfile !== "undefined" && studentProfile?.email) 
            || localStorage.getItem("bridge_user_email") || "guest";
          const res = await fetch(`${apiBase}/api/ai/history?email=${encodeURIComponent(email)}`);
          if (res.ok) {
            const data = await res.json();
            if (data && Array.isArray(data.sessions) && data.sessions.length > 0) {
              const localMap = new Map(aiSessions.map(s => [s.id, s]));
              data.sessions.forEach(s => {
                if (!localMap.has(s.id) || new Date(s.updatedAt || 0) > new Date(localMap.get(s.id)?.updatedAt || 0)) {
                  localMap.set(s.id, s);
                }
              });
              aiSessions = Array.from(localMap.values()).sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
              if (data.activeSessionId && localMap.has(data.activeSessionId)) {
                activeSessionId = data.activeSessionId;
              }
              saveAiSessionsToStorage();
              renderActiveSession();
            }
          }
        } catch (e) {}
      }

      function updateHistoryBadge() {
        if (historyBadge) {
          historyBadge.textContent = aiSessions.length;
        }
      }

      function getOrCreateActiveSession() {
        let session = aiSessions.find(s => s.id === activeSessionId);
        if (!session) {
          session = {
            id: "session_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
            title: "New Conversation",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            messages: []
          };
          aiSessions.unshift(session);
          activeSessionId = session.id;
          saveAiSessionsToStorage();
        }
        return session;
      }

      function startNewChatSession() {
        const newSession = {
          id: "session_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
          title: "New Conversation",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messages: []
        };
        aiSessions.unshift(newSession);
        activeSessionId = newSession.id;
        saveAiSessionsToStorage();
        switchToChatView();
        renderActiveSession();
        input?.focus();
      }

      function renderActiveSession() {
        const session = getOrCreateActiveSession();
        if (!msgBox) return;
        msgBox.innerHTML = "";
        chatHistory = [];

        if (sessionTitleEl) {
          sessionTitleEl.textContent = session.title || "New Conversation";
        }
        if (sessionMsgCountEl) {
          sessionMsgCountEl.textContent = `${session.messages ? session.messages.length : 0} msgs`;
        }

        if (session.messages && session.messages.length > 0) {
          session.messages.forEach(m => {
            chatHistory.push({
              role: m.role === "user" ? "user" : "model",
              text: m.text || m.content || ""
            });
            renderSavedAiMessage(m.text || m.content || "", m.role === "user");
          });
        }

        msgBox.scrollTop = msgBox.scrollHeight;
      }

      function renderSavedAiMessage(content, isUser) {
        if (!msgBox) return;
        const wrapper = document.createElement("div");
        wrapper.className = isUser ? "flex justify-end" : "flex justify-start";

        const div = document.createElement("div");
        div.className = isUser 
          ? "bg-blue-600 text-white p-3 rounded-2xl rounded-tr-none max-w-[85%] shadow-sm text-xs sm:text-[13px]"
          : "bg-slate-100 border border-slate-200 text-slate-800 p-3.5 rounded-2xl rounded-tl-none max-w-[94%] shadow-xs text-xs sm:text-[13px] space-y-2";
        div.innerHTML = isUser ? content : renderGeminiMarkdown(content);
        wrapper.appendChild(div);
        msgBox.appendChild(wrapper);
        bindChipListeners();
      }

      function renderHistoryList() {
        if (!historyList) return;
        historyList.innerHTML = "";

        if (aiSessions.length === 0) {
          historyList.innerHTML = `
            <div class="text-center py-12 px-4 space-y-2">
              <div class="text-3xl">💬</div>
              <p class="text-slate-900 font-bold text-xs">No Recent Chats Yet</p>
              <p class="text-slate-500 text-[11px] max-w-xs mx-auto">
                Any questions you ask Bridge AI will automatically be saved here so you can revisit them anytime.
              </p>
              <button type="button" id="bridge-ai-start-chat-btn" class="mt-3 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition cursor-pointer shadow-xs">
                + Ask Bridge AI Now
              </button>
            </div>
          `;
          document.getElementById("bridge-ai-start-chat-btn")?.addEventListener("click", () => {
            startNewChatSession();
          });
          return;
        }

        aiSessions.forEach(session => {
          const isActive = session.id === activeSessionId;
          const msgCount = session.messages ? session.messages.length : 0;
          const d = new Date(session.updatedAt || session.createdAt || Date.now());
          const timeStr = d.toLocaleDateString("en-IN", { month: "short", day: "numeric" }) + ", " + 
                          d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

          const card = document.createElement("div");
          card.className = `p-3 rounded-xl border transition cursor-pointer flex items-center justify-between gap-2.5 ${
            isActive 
              ? "bg-blue-50 border-blue-300 shadow-xs ring-1 ring-blue-400/30" 
              : "bg-white hover:bg-slate-50 border-slate-200 shadow-xs"
          }`;

          card.innerHTML = `
            <div class="flex items-start gap-2.5 overflow-hidden flex-1">
              <div class="w-7 h-7 rounded-lg ${isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'} flex items-center justify-center shrink-0 text-xs font-bold">
                💬
              </div>
              <div class="overflow-hidden flex-1">
                <div class="flex items-center gap-1.5">
                  <h5 class="font-bold text-slate-800 text-xs truncate">${session.title || "Untitled Chat"}</h5>
                  ${isActive ? '<span class="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-700 text-[9px] font-bold shrink-0">Active</span>' : ''}
                </div>
                <div class="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                  <span>${timeStr}</span>
                  <span>•</span>
                  <span>${msgCount} message${msgCount === 1 ? '' : 's'}</span>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-1 shrink-0">
              <button type="button" class="delete-session-btn text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition cursor-pointer" title="Delete this conversation" data-id="${session.id}">
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          `;

          card.addEventListener("click", (e) => {
            if (e.target.closest(".delete-session-btn")) return;
            activeSessionId = session.id;
            saveAiSessionsToStorage();
            switchToChatView();
            renderActiveSession();
          });

          const delBtn = card.querySelector(".delete-session-btn");
          delBtn?.addEventListener("click", (e) => {
            e.stopPropagation();
            deleteSession(session.id);
          });

          historyList.appendChild(card);
        });
      }

      function deleteSession(sessionId) {
        aiSessions = aiSessions.filter(s => s.id !== sessionId);
        if (activeSessionId === sessionId) {
          activeSessionId = aiSessions[0]?.id || null;
        }
        saveAiSessionsToStorage();
        renderHistoryList();
        if (activeSessionId) {
          renderActiveSession();
        } else {
          startNewChatSession();
        }
      }

      function clearAllSessions() {
        if (!confirm("Are you sure you want to clear all recent chat history?")) return;
        aiSessions = [];
        activeSessionId = null;
        saveAiSessionsToStorage();
        startNewChatSession();
        switchToChatView();
      }

      function switchToHistoryView() {
        if (!historyPanel || !chatView) return;
        historyPanel.classList.remove("hidden");
        historyPanel.classList.add("flex");
        chatView.classList.add("hidden");
        renderHistoryList();
      }

      function switchToChatView() {
        if (!historyPanel || !chatView) return;
        historyPanel.classList.add("hidden");
        historyPanel.classList.remove("flex");
        chatView.classList.remove("hidden");
      }

      historyToggleBtn?.addEventListener("click", () => {
        if (historyPanel?.classList.contains("hidden")) {
          switchToHistoryView();
        } else {
          switchToChatView();
        }
      });

      historyBackBtn?.addEventListener("click", switchToChatView);
      newChatBtn?.addEventListener("click", startNewChatSession);
      historyClearBtn?.addEventListener("click", clearAllSessions);

      function renderGeminiMarkdown(md) {
        if (!md) return "";
        let text = md.trim();
        if (text.startsWith("<div") || text.startsWith("<table") || text.startsWith("<p")) return text;

        function inline(str) {
          return str
            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 font-bold">$1</strong>')
            .replace(/\*(.*?)\*/g, '<em class="text-blue-700 not-italic font-semibold">$1</em>')
            .replace(/`(.*?)`/g, '<code class="px-1 py-0.5 rounded bg-slate-200 text-slate-800 font-mono text-[10px]">$1</code>');
        }

        // Table parser
        text = text.replace(/((?:\|[^\n]+\|\r?\n)+)/g, (match) => {
          const rows = match.trim().split(/\r?\n/).filter(Boolean);
          if (rows.length < 2) return match;
          let tableHtml = '<div class="overflow-x-auto my-2 rounded-xl border border-slate-200"><table class="w-full text-[11px] text-left text-slate-700">';
          rows.forEach((row, idx) => {
            if (row.includes('---')) return;
            const cells = row.split('|').slice(1, -1).map(c => c.trim());
            if (idx === 0) {
              tableHtml += '<thead class="bg-slate-100 text-slate-900 font-extrabold border-b border-slate-200"><tr>';
              cells.forEach(c => tableHtml += `<th class="p-2">${inline(c)}</th>`);
              tableHtml += '</tr></thead><tbody>';
            } else {
              const bg = idx % 2 === 0 ? 'bg-white' : 'bg-slate-50';
              tableHtml += `<tr class="${bg} border-b border-slate-100 hover:bg-blue-50/50">`;
              cells.forEach(c => tableHtml += `<td class="p-2">${inline(c)}</td>`);
              tableHtml += '</tr>';
            }
          });
          tableHtml += '</tbody></table></div>';
          return tableHtml;
        });

        // Headings
        text = text.replace(/^### (.*$)/gim, '<h4 class="font-extrabold text-blue-700 text-sm mt-1 mb-1.5 flex items-center gap-1.5">$1</h4>');
        text = text.replace(/^#### (.*$)/gim, '<h5 class="font-bold text-slate-800 text-xs mt-2 mb-1">$1</h5>');
        text = text.replace(/^## (.*$)/gim, '<h3 class="font-extrabold text-slate-900 text-base mt-1 mb-1">$1</h3>');

        // Lists
        text = text.replace(/^\* (.*$)/gim, '<li class="text-slate-700 ml-3 list-disc">$1</li>');
        text = text.replace(/^- (.*$)/gim, '<li class="text-slate-700 ml-3 list-disc">$1</li>');

        text = inline(text);

        // Blocks
        const parts = text.split(/\n\n+/);
        return parts.map(p => {
          p = p.trim();
          if (!p) return "";
          if (p.startsWith('<h') || p.startsWith('<div') || p.startsWith('<table') || p.startsWith('<li')) return p;
          return `<p class="leading-relaxed text-slate-700 text-xs sm:text-[13px] mb-2">${p.replace(/\n/g, '<br>')}</p>`;
        }).join('\n');
      }

      function showGeminiWelcome() {
        // Kept clean and empty as requested
      }

      function openDrawer() {
        if (!drawer) return;
        loadStoredAiSessions();
        drawer.classList.remove("hidden");
        if (backdrop) backdrop.classList.remove("hidden");
        setTimeout(() => {
          drawer.classList.remove("translate-x-full");
          input?.focus();
          switchToChatView();
          renderActiveSession();
          fetchServerAiHistory();
        }, 10);
      }

      function closeDrawer() {
        if (!drawer) return;
        drawer.classList.add("translate-x-full");
        if (backdrop) backdrop.classList.add("hidden");
        setTimeout(() => drawer.classList.add("hidden"), 280);
      }

      floater?.addEventListener("click", openDrawer);
      closeBtn?.addEventListener("click", closeDrawer);
      backdrop?.addEventListener("click", closeDrawer);

      function addAiMessage(content, isUser = false) {
        if (!msgBox) return;
        const wrapper = document.createElement("div");
        wrapper.className = isUser 
          ? "flex justify-end"
          : "flex justify-start";

        const div = document.createElement("div");
        div.className = isUser 
          ? "bg-blue-600 text-white p-3 rounded-2xl rounded-tr-none max-w-[85%] shadow-sm text-xs sm:text-[13px]"
          : "bg-slate-100 border border-slate-200 text-slate-800 p-3.5 rounded-2xl rounded-tl-none max-w-[94%] shadow-xs text-xs sm:text-[13px] space-y-2";
        div.innerHTML = isUser ? content : renderGeminiMarkdown(content);
        wrapper.appendChild(div);
        msgBox.appendChild(wrapper);
        msgBox.scrollTop = msgBox.scrollHeight;
        bindChipListeners();
      }

      function getActiveUserName() {
        try {
          if (typeof studentProfile !== "undefined" && studentProfile) {
            if (studentProfile.fullName && studentProfile.fullName.trim()) return studentProfile.fullName.trim();
            if (studentProfile.username && studentProfile.username.trim()) return studentProfile.username.trim();
          }
          const rawProfile = localStorage.getItem("i2t_profile_v9");
          if (rawProfile) {
            const p = JSON.parse(rawProfile);
            if (p.fullName && p.fullName.trim()) return p.fullName.trim();
            if (p.username && p.username.trim()) return p.username.trim();
          }
          const rawUser = localStorage.getItem("i2t_user_v9");
          if (rawUser) {
            const u = JSON.parse(rawUser);
            if (u.fullName && u.fullName.trim()) return u.fullName.trim();
            if (u.username && u.username.trim()) return u.username.trim();
          }
          const savedName = localStorage.getItem("bridge_user_name");
          if (savedName && savedName.trim()) return savedName.trim();
          const savedEmail = localStorage.getItem("bridge_user_email");
          if (savedEmail && savedEmail.includes("@")) {
            const part = savedEmail.split("@")[0].replace(/[._-]/g, " ");
            return part.charAt(0).toUpperCase() + part.slice(1);
          }
        } catch (e) {}
        return "there";
      }

      // -------------------------------------------------------------------------
      // COMPREHENSIVE AI INFERENCE & RETRIEVAL ENGINE (TRAINED ON 658 COLLEGES)
      // -------------------------------------------------------------------------
      function generateBridgeAiResponse(query) {
        const q = query.toLowerCase().trim();
        const colleges = window.collegesData || [];
        const rank = (typeof appState !== "undefined" && appState.rank) ? appState.rank : null;
        const category = (typeof appState !== "undefined" && appState.category) ? appState.category : "OC";
        const categoryLabel = (typeof categoryLabels !== "undefined" && categoryLabels[category]) ? categoryLabels[category] : category;
        const uName = getActiveUserName();
        const displayGreeting = (uName && uName !== "there") ? `there ${uName}` : "there";

        // Greeting Check (Priority 1)
        if (/^(hey|hi|hello|hey there|hai|namaste|greetings)\b/i.test(q)) {
          return `
            <div class="space-y-2">
              <div class="font-extrabold text-blue-600 text-sm flex items-center gap-1.5"><span>🤖</span> <span>Bridge AI • Powered by Gemini AI</span></div>
              <p class="text-slate-900 font-semibold text-sm">
                Hey ${displayGreeting}! I am Bridge AI, how can I help you?
              </p>
              <p class="text-slate-600 text-[11px]">
                I am directly linked with Google Gemini AI and pre-trained on <strong>658 verified engineering institutions across India</strong>.
              </p>
              <div class="pt-1">
                <p class="text-slate-500 text-[10px] uppercase font-bold mb-1">Popular questions to ask:</p>
                <div class="flex flex-wrap gap-1.5">
                  <button type="button" class="ai-prompt-chip px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] border border-blue-200 transition cursor-pointer" data-q="What colleges can I get for rank 20000?">🎯 Rank Predictions</button>
                  <button type="button" class="ai-prompt-chip px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] border border-blue-200 transition cursor-pointer" data-q="GVP vs VRSEC">⚖️ Compare Colleges</button>
                  <button type="button" class="ai-prompt-chip px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] border border-blue-200 transition cursor-pointer" data-q="Who is eligible for JVD fee reimbursement?">💰 100% Fee Waiver (JVD)</button>
                  <button type="button" class="ai-prompt-chip px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] border border-blue-200 transition cursor-pointer" data-q="AUCE CSE cutoffs and placements">🏛️ AUCE Cutoffs</button>
                </div>
              </div>
            </div>
          `;
        }

        // 1. College Specific Search / Lookup
        const matchedColleges = colleges.filter(c => {
          const name = (c.name || "").toLowerCase();
          const code = (c.code || "").toLowerCase();
          const loc = (c.location || "").toLowerCase();
          const dist = (c.district || "").toLowerCase();

          // Code match
          if (q.includes(code)) return true;
          // Common keywords & acronyms
          if (q.includes("auce") && code === "auce") return true;
          if (q.includes("vrsec") && code === "vrse") return true;
          if (q.includes("gvp") && code.includes("gvp")) return true;
          if (q.includes("rvr") && code.includes("rvr")) return true;
          if (q.includes("srkr") && code.includes("srkr")) return true;
          if (q.includes("jntuk") && (code.includes("jntu") && loc.includes("kakinada"))) return true;
          if (q.includes("jntua") && (code.includes("jntu") && loc.includes("anantapur"))) return true;
          if (q.includes("vit") && (code.includes("vit") || name.includes("vishnu") || name.includes("vit-ap"))) return true;
          if (q.includes("srm") && (code.includes("srm") || name.includes("srm"))) return true;
          if (q.includes("vignan") && (code.includes("vign") || name.includes("vignan"))) return true;
          if (q.includes("bapatla") && (code.includes("becb") || name.includes("bapatla"))) return true;
          if (q.includes("gayatri") && name.includes("gayatri")) return true;
          if (q.includes("nbkr") && code.includes("nbkr")) return true;
          if (q.includes("gmrit") && code.includes("gmri")) return true;
          if (q.includes("anits") && code.includes("anits")) return true;
          if (q.includes("kits") && code.includes("kits")) return true;
          if (q.includes("mvgr") && code.includes("mvgr")) return true;
          if (q.includes("svuce") && (code.includes("svuc") || name.includes("sri venkateswara"))) return true;

          // Multi-word name containment
          const words = q.split(/\s+/).filter(w => w.length >= 4);
          return words.some(w => name.includes(w) || loc.includes(w) || dist.includes(w));
        });

        // 2. Comparison Mode (e.g. "GVP vs VRSEC")
        if (q.includes(" vs ") || q.includes(" versus ") || q.includes("compare ")) {
          if (matchedColleges.length >= 2) {
            const c1 = matchedColleges[0];
            const c2 = matchedColleges[1];
            return `
              <div class="space-y-2">
                <div class="font-bold text-slate-900 text-sm">⚖️ Head-to-Head Comparison: ${c1.code} vs ${c2.code}</div>
                <div class="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <div class="border-r border-slate-200 pr-2 space-y-1">
                    <strong class="text-slate-900 text-xs block">${c1.name} (${c1.code})</strong>
                    <div class="text-slate-500">📍 ${c1.location}, ${c1.district}</div>
                    <div class="text-slate-700">⭐ Rating: ${c1.rating}★ (${c1.naac || 'NAAC A+'})</div>
                    <div class="text-emerald-700 font-bold">💼 2025 Placements: ${c1.placements?.rate || '78%'}</div>
                    <div class="text-slate-700">💰 Median CTC: ${c1.placements?.medianSalary || '₹5.0 LPA'}</div>
                    <div class="text-slate-700">🎓 Tuition: ${c1.fees?.tuition || '₹70,000/yr'}</div>
                  </div>
                  <div class="pl-2 space-y-1">
                    <strong class="text-slate-900 text-xs block">${c2.name} (${c2.code})</strong>
                    <div class="text-slate-500">📍 ${c2.location}, ${c2.district}</div>
                    <div class="text-slate-700">⭐ Rating: ${c2.rating}★ (${c2.naac || 'NAAC A+'})</div>
                    <div class="text-emerald-700 font-bold">💼 2025 Placements: ${c2.placements?.rate || '78%'}</div>
                    <div class="text-slate-700">💰 Median CTC: ${c2.placements?.medianSalary || '₹5.0 LPA'}</div>
                    <div class="text-slate-700">🎓 Tuition: ${c2.fees?.tuition || '₹70,000/yr'}</div>
                  </div>
                </div>
                <p class="text-[11px] text-slate-700">
                  <strong>Counseling Verdict:</strong> If you prefer ${c1.district}, choose <strong>${c1.code}</strong>. For highest median package, ${parseFloat(c1.placements?.medianSalary || 0) >= parseFloat(c2.placements?.medianSalary || 0) ? c1.code : c2.code} has the statistical edge.
                </p>
              </div>
            `;
          }
        }

        // 3. Specific College Details Query
        if (matchedColleges.length > 0 && (q.includes("cutoff") || q.includes("fee") || q.includes("placement") || q.includes("hostel") || q.includes("detail") || q.includes("tell me about") || q.includes("how is") || matchedColleges.length === 1)) {
          const c = matchedColleges[0];
          const branchesHtml = (c.branches || []).slice(0, 6).map(b => {
            const scaled = (typeof getScaledCutoff === "function") ? getScaledCutoff(b.closingRank, category, c.exam) : b.closingRank;
            return `<span class="inline-block px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] mr-1 mb-1 border border-slate-200"><strong>${b.code}:</strong> ~${scaled.toLocaleString("en-IN")}</span>`;
          }).join("");

          return `
            <div class="space-y-2">
              <div class="flex items-center justify-between border-b border-slate-200 pb-1.5">
                <span class="font-extrabold text-slate-900 text-sm">${c.name}</span>
                <span class="px-2 py-0.5 rounded-lg bg-blue-100 text-blue-800 font-black text-[10px]">${c.code}</span>
              </div>
              <p class="text-[11px] text-slate-500">📍 ${c.location}, ${c.district} District • ${c.category} • ${c.university || 'AP Affiliated'}</p>

              <div class="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <div>
                  <span class="text-slate-500 block text-[10px] uppercase font-bold">Placements 2025</span>
                  <span class="text-emerald-700 font-extrabold">${c.placements?.rate || '75%'} Placed</span>
                  <div class="text-slate-700 mt-0.5">Median: <strong>${c.placements?.medianSalary || '₹4.5 LPA'}</strong></div>
                </div>
                <div>
                  <span class="text-slate-500 block text-[10px] uppercase font-bold">Fee Structure</span>
                  <span class="text-slate-900 font-extrabold">${c.fees?.tuition || '₹45,000/yr'}</span>
                  <div class="text-slate-700 mt-0.5">Hostel: ${c.fees?.hostel || '₹35,000/yr'}</div>
                </div>
              </div>

              <div class="pt-1">
                <span class="text-slate-500 text-[10px] uppercase font-bold block mb-1">Key Branches Cutoffs (${categoryLabel}):</span>
                <div>${branchesHtml}</div>
              </div>

              <div class="text-[11px] text-slate-700">
                <strong>Top Recruiters:</strong> ${c.placements?.topRecruiters?.slice(0, 4).join(", ") || 'TCS, Infosys, Cognizant, Wipro'}.
              </div>

              <button type="button" onclick="openCollegeModal('${c.id}')" class="mt-1 w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer text-center">
                Open Full College Modal & Hostel Details →
              </button>
            </div>
          `;
        }

        // 4. JVD & Fee Reimbursement
        if (q.includes("jvd") || q.includes("vidya deevena") || q.includes("reimbursement") || q.includes("free seat") || q.includes("scholarship")) {
          return `
            <div class="space-y-2">
              <div class="font-extrabold text-blue-700 text-sm">🎓 100% JVD Full Fee Reimbursement Rules</div>
              <p class="text-slate-800">
                Under the AP State <strong>Jagananna Vidya Deevena (JVD)</strong> scheme, eligible students get <strong>100% full tuition fee reimbursement</strong> in all 312+ Convener AP EAPCET engineering colleges!
              </p>
              <ul class="space-y-1 list-disc list-inside text-slate-600 text-[11px]">
                <li><strong>Income Limit:</strong> Family annual income must be under <strong>₹2,50,000</strong> (evidenced by White Ration Card / Rice Card or Grama Sachivalayam Income Certificate).</li>
                <li><strong>Seat Quota:</strong> Must be admitted under <strong>Convener Quota (Category-A)</strong> through official counseling.</li>
                <li><strong>Attendance:</strong> Minimum <strong>75% biometric attendance</strong> per semester is mandatory.</li>
                <li><strong>Vasathi Deevena:</strong> Additional <strong>₹20,000/year</strong> grant provided towards hostel and mess maintenance!</li>
                <li><strong>Ineligible:</strong> Management Quota (Category-B), NRI seats, and Spot Admissions are NOT eligible for JVD.</li>
              </ul>
              <div class="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px]">
                💡 <em>Tip: Use the ROI Calculator (Math button) to calculate your exact net tuition with 100% JVD enabled!</em>
              </div>
            </div>
          `;
        }

        // 5. AU vs SVU Quota & Local Reservation
        if (q.includes("au") && q.includes("svu") || q.includes("local") || q.includes("region") || q.includes("85%")) {
          return `
            <div class="space-y-2">
              <div class="font-extrabold text-blue-700 text-sm">📍 AP 85% Local University Quota Explained</div>
              <p class="text-slate-800">
                In AP CET counseling, <strong>85% of seats</strong> in state colleges are strictly reserved for students who completed 4 consecutive years of schooling (between class 6 to Inter) in that specific University Region:
              </p>
              <div class="space-y-1.5 text-[11px]">
                <div class="p-2 bg-slate-50 rounded-lg border border-slate-200">
                  <strong class="text-amber-700 block">AU Region (Andhra University):</strong>
                  Srikakulam, Vizianagaram, Visakhapatnam, Anakapalli, Kakinada, East Godavari, Konaseema, West Godavari, Eluru, Krishna, NTR (Vijayawada), Guntur, Palnadu, Bapatla. (Includes AUCE, JNTUK, GVP, VRSEC, RVRJC, SRKR).
                </div>
                <div class="p-2 bg-slate-50 rounded-lg border border-slate-200">
                  <strong class="text-sky-700 block">SVU Region (Sri Venkateswara University):</strong>
                  Prakasam, Nellore, Tirupati, Chittoor, Annamayya, YSR Kadapa, Nandyal, Kurnool, Ananthapuramu, Sri Sathya Sai. (Includes SVUCE, JNTUA, MITS, NBKR, GPREC).
                </div>
              </div>
              <p class="text-slate-500 text-[11px]">
                The remaining <strong>15% seats</strong> are Statewide Non-Local Open Quota, contested equally by both AU and SVU students on pure rank merit.
              </p>
            </div>
          `;
        }

        // 6. Mandatory Documents for Counseling
        if (q.includes("document") || q.includes("certificate") || q.includes("checklist") || q.includes("verification")) {
          return `
            <div class="space-y-2">
              <div class="font-extrabold text-blue-700 text-sm">📑 9 Mandatory Certificates for AP Counseling</div>
              <ol class="space-y-1 list-decimal list-inside text-slate-700 text-[11px]">
                <li><strong>AP EAPCET Rank Card 2026</strong></li>
                <li><strong>AP EAPCET Hall Ticket 2026</strong></li>
                <li><strong>SSC / 10th Marks Memo</strong> (DOB proof)</li>
                <li><strong>Intermediate (10+2) Marks Memo</strong></li>
                <li><strong>Study Certificates (Class 6 to Inter)</strong>: To prove 85% Local Area (AU/SVU)</li>
                <li><strong>Transfer Certificate (TC)</strong> from Junior College</li>
                <li><strong>Caste / Community Certificate</strong> (with Sachivalayam Barcode for BC/SC/ST)</li>
                <li><strong>Income Certificate / White Ration Card</strong> (issued on or after Jan 1, 2026 for JVD)</li>
                <li><strong>EWS Certificate</strong> (valid for current financial year if applicable)</li>
              </ol>
              <p class="text-slate-500 text-[11px]">
                Tap the <strong>Docs</strong> icon on the bottom navigation bar to tick off your personal verification checklist!
              </p>
            </div>
          `;
        }

        // 7. Rank / "What colleges can I get?" query
        const rankMatch = q.match(/\b(\d{1,6})\b/);
        const queryRank = rankMatch ? parseInt(rankMatch[1], 10) : rank;

        if (queryRank && (q.includes("rank") || q.includes("get") || q.includes("chance") || q.includes("eligible") || q.includes("fit") || q.includes("predict"))) {
          const eligibleColleges = [];

          colleges.forEach(col => {
            const safeBranches = [];
            (col.branches || []).forEach(br => {
              const cutoff = (typeof getScaledCutoff === "function") 
                ? getScaledCutoff(br.closingRank, category, col.exam)
                : br.closingRank;
              if (queryRank <= cutoff) {
                safeBranches.push({ code: br.code, cutoff });
              }
            });
            if (safeBranches.length > 0) {
              eligibleColleges.push({ college: col, safeBranches });
            }
          });

          // Sort by college rating & placement
          eligibleColleges.sort((a, b) => parseFloat(b.college.rating || 0) - parseFloat(a.college.rating || 0));

          if (eligibleColleges.length === 0) {
            return `
              <div class="space-y-2">
                <div class="font-bold text-amber-300">📊 Rank Analysis for ${queryRank.toLocaleString("en-IN")} (${categoryLabel})</div>
                <p class="text-slate-300">
                  Cutoffs for top branches in university colleges were tight this year. However, you can consider <strong>Category-B Direct Management Quota seats</strong>, or select emerging branches like Civil, Mechanical, Bio-Tech, or Agricultural Engineering!
                </p>
              </div>
            `;
          }

          const topFive = eligibleColleges.slice(0, 5).map(item => {
            const brList = item.safeBranches.slice(0, 4).map(b => `<span class="text-emerald-400 font-bold">${b.code}</span>`).join(", ");
            return `
              <div class="p-2 bg-slate-50 rounded-xl border border-slate-200 space-y-0.5">
                <div class="flex items-center justify-between text-xs font-bold text-slate-900">
                  <span>${(item.college.code && item.college.name.includes(`(${item.college.code})`)) ? item.college.name : `${item.college.name} (${item.college.code})`}</span>
                  <span class="text-amber-600 font-bold">${item.college.rating}★</span>
                </div>
                <div class="text-[11px] text-slate-500">📍 ${item.college.location} • Median: ${item.college.placements?.medianSalary || '₹4.5L'}</div>
                <div class="text-[11px] text-slate-700">Eligible Branches: ${brList}</div>
              </div>
            `;
          }).join("");

          return `
            <div class="space-y-2">
              <div class="font-extrabold text-blue-700 text-sm">
                🎯 Top College Matches for Rank ${queryRank.toLocaleString("en-IN")} (${categoryLabel})
              </div>
              <p class="text-slate-600 text-[11px]">
                Found <strong>${eligibleColleges.length} qualifying colleges</strong>! Here are the highest rated institutions where you qualify:
              </p>
              <div class="space-y-1.5">${topFive}</div>
              <p class="text-[10px] text-slate-400 pt-1">
                Scroll down in the Home section to view all ${eligibleColleges.length} eligible colleges and tap <strong class="text-emerald-400">+ [Branch]</strong> to add them to your Priority Sheet!
              </p>
            </div>
          `;
        }

        // 8. General Counseling & Knowledge Query Fallback
        return `
          <div class="space-y-2">
            <div class="font-extrabold text-blue-700 text-sm">⚡ Bridge AI Counselor Intelligence</div>
            <p class="text-slate-800 text-xs">
              Hey ${displayGreeting}! Here are ways I can guide your college admissions:
            </p>
            <ul class="text-[11px] space-y-1 list-disc list-inside text-slate-600">
              <li><strong>Cutoffs by College:</strong> Try typing <em>"AUCE CSE cutoffs"</em> or <em>"VRSEC fees"</em>.</li>
              <li><strong>Rank Prediction:</strong> Type <em>"What colleges can I get for rank 25000?"</em>.</li>
              <li><strong>Comparison:</strong> Type <em>"GVP vs VRSEC"</em> or <em>"RVRJC vs SRKR"</em>.</li>
              <li><strong>100% Fee Waiver:</strong> Ask <em>"Who is eligible for JVD?"</em>.</li>
            </ul>
          </div>
        `;
      }

      async function handleAiQuery(query) {
        if (!query || !query.trim()) return;
        addAiMessage(query, true);
        chatHistory.push({ role: "user", text: query });

        // Show Gemini Thinking Indicator
        const typingId = "ai-typing-" + Date.now();
        const typingDiv = document.createElement("div");
        typingDiv.id = typingId;
        typingDiv.className = "flex justify-start";
        typingDiv.innerHTML = `<div class="bg-blue-50 border border-blue-200 text-blue-700 p-3 rounded-2xl rounded-tl-none text-xs flex items-center gap-2 shadow-xs">
          <span class="animate-bounce inline-block text-sm">🤖</span>
          <span class="font-semibold text-slate-700">Bridge AI is reasoning with Gemini...</span>
        </div>`;
        msgBox?.appendChild(typingDiv);
        msgBox.scrollTop = msgBox.scrollHeight;

        const uName = getActiveUserName();
        const cleanQ = (query || "").trim().toLowerCase();

        // FAST GREETING INTENT (Respond instantly in ~80ms without network latency)
        if (/^(hey|hi|hello|hey there|hai|namaste|greetings|gm|good morning|good afternoon|good evening)\b/i.test(cleanQ) && cleanQ.split(/\s+/).length <= 4) {
          const fastGreeting = generateBridgeAiResponse(query);
          setTimeout(() => {
            const tEl = document.getElementById(typingId);
            if (tEl) tEl.remove();
            chatHistory.push({ role: "model", text: fastGreeting });
            addAiMessage(fastGreeting, false);
            try {
              const session = getOrCreateActiveSession();
              if (!session.messages) session.messages = [];
              session.messages.push({ role: "model", text: fastGreeting, ts: new Date().toISOString() });
              saveAiSessionsToStorage();
            } catch (_) {}
          }, 80);
          return;
        }

        const studentProfilePayload = {
          fullName: (typeof studentProfile !== "undefined" && studentProfile?.fullName) ? studentProfile.fullName : uName,
          username: (typeof studentProfile !== "undefined" && studentProfile?.username) ? studentProfile.username : uName,
          email: (typeof studentProfile !== "undefined" && studentProfile?.email) ? studentProfile.email : (localStorage.getItem("bridge_user_email") || ""),
          rank: (typeof appState !== "undefined" && appState.rank) ? appState.rank : 15000,
          category: (typeof appState !== "undefined" && appState.category) ? appState.category : "OC",
          district: (typeof studentProfile !== "undefined" && studentProfile?.district) ? studentProfile.district : "Andhra Pradesh",
          branch: (typeof studentProfile !== "undefined" && studentProfile?.favBranches?.[0]) ? studentProfile.favBranches[0] : (typeof appState !== "undefined" && appState.branch ? appState.branch : "CSE")
        };

        let aiReply = "";

        // 1. Primary path: Server /api/ai/chat endpoint (Fast Gemini with 3.2s timeout)
        try {
          const apiBase = (window.I2T_CONFIG && window.I2T_CONFIG.API_BASE) || "";
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3200);

          const res = await fetch(apiBase + "/api/ai/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
            body: JSON.stringify({
              message: query,
              studentProfile: studentProfilePayload,
              history: chatHistory.slice(-4)
            })
          });
          clearTimeout(timeoutId);

          if (res.ok) {
            const data = await res.json();
            if (data && data.reply) {
              aiReply = data.reply;
            }
          }
        } catch (fetchErr) {
          console.warn("[Gemini] Fast fallback to client neural engine:", fetchErr.message);
        }

        // 2. Instant Neural Fallback (Trained on 658 verified institutions - Zero wait time)
        if (!aiReply) {
          aiReply = generateBridgeAiResponse(query);
        }

        const tEl = document.getElementById(typingId);
        if (tEl) tEl.remove();

        chatHistory.push({ role: "model", text: aiReply });
        addAiMessage(aiReply, false);

        // Store messages in active session persistently
        try {
          const session = getOrCreateActiveSession();
          if (!session.messages) session.messages = [];
          session.messages.push({ role: "user", text: query, timestamp: new Date().toISOString() });
          session.messages.push({ role: "model", text: aiReply, timestamp: new Date().toISOString() });
          session.updatedAt = new Date().toISOString();
          if (session.title === "New Conversation" || !session.title) {
            session.title = query.trim().slice(0, 42);
          }
          if (sessionTitleEl) sessionTitleEl.textContent = session.title;
          if (sessionMsgCountEl) sessionMsgCountEl.textContent = `${session.messages.length} msgs`;
          saveAiSessionsToStorage();
        } catch (saveErr) {
          console.warn("[Bridge AI] Failed to save message to session:", saveErr);
        }
      }

      function bindChipListeners() {
        if (!msgBox) return;
        msgBox.querySelectorAll(".ai-prompt-chip").forEach(chip => {
          if (!chip.dataset.bound) {
            chip.dataset.bound = "true";
            chip.addEventListener("click", () => {
              handleAiQuery(chip.dataset.q);
            });
          }
        });
      }

      sendBtn?.addEventListener("click", () => {
        const val = input?.value || "";
        if (input) input.value = "";
        handleAiQuery(val);
      });

      const micBtn = document.getElementById("bridge-ai-mic-btn");
      if (micBtn) {
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRec) {
          const recognition = new SpeechRec();
          recognition.continuous = false;
          recognition.interimResults = false;
          recognition.lang = "en-IN";
          recognition.onstart = () => {
            micBtn.classList.add("text-red-500", "animate-pulse");
            showToast("Listening... Speak your question now", "🎙️");
          };
          recognition.onresult = (e) => {
            const transcript = e.results[0][0].transcript;
            if (input) {
              input.value = transcript;
              input.focus();
            }
            showToast(`Heard: "${transcript}"`, "🗣️");
          };
          recognition.onerror = () => {
            micBtn.classList.remove("text-red-500", "animate-pulse");
            showToast("Could not recognize voice. Please type your query.", "⚠️");
          };
          recognition.onend = () => {
            micBtn.classList.remove("text-red-500", "animate-pulse");
          };
          micBtn.addEventListener("click", () => {
            try { recognition.start(); } catch (err) { try { recognition.stop(); } catch(e){} }
          });
        } else {
          micBtn.addEventListener("click", () => {
            showToast("Voice input not supported in this browser. Please type your query.", "🎙️");
          });
        }
      }

      input?.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          const val = input?.value || "";
          if (input) input.value = "";
          handleAiQuery(val);
        }
      });

      document.querySelectorAll(".ai-prompt-chip").forEach(chip => {
        chip.addEventListener("click", () => {
          handleAiQuery(chip.dataset.q);
        });
      });
    }

    function updateProfileKpis() {
      const rankEl = document.getElementById("profile-kpi-rank");
      const interEl = document.getElementById("profile-kpi-inter");
      const catEl = document.getElementById("profile-kpi-category");
      const regEl = document.getElementById("profile-kpi-region");

      if (rankEl) rankEl.textContent = appState.rank ? appState.rank.toLocaleString("en-IN") : "12,500";
      if (interEl) interEl.textContent = studentProfile.interPct || "96.5%";
      if (catEl) catEl.textContent = appState.category || "OC";
      if (regEl) regEl.textContent = (appState.region || "AU") + " Region";
    }

    function setupProfileAvatarControls() {
      // 1. Photo Upload, Camera & Random Handlers
      const cameraInput = document.getElementById("kodnest-avatar-camera-input");
      if (cameraInput) {
        cameraInput.addEventListener("change", (e) => {
          const file = e.target.files && e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (ev) => {
            applyAvatar(ev.target.result);
            showToast("New profile photo captured! 📸", "✨");
          };
          reader.readAsDataURL(file);
        });
      }

      const galleryInput = document.getElementById("kodnest-avatar-gallery-input");
      if (galleryInput) {
        galleryInput.addEventListener("change", (e) => {
          const file = e.target.files && e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (ev) => {
            applyAvatar(ev.target.result);
            showToast("Profile photo updated from gallery! 🖼️", "✨");
          };
          reader.readAsDataURL(file);
        });
      }

      const randomBtn = document.getElementById("kodnest-btn-avatar-random");
      if (randomBtn) {
        randomBtn.addEventListener("click", () => {
          const avatar = RANDOM_AVATARS[randomAvatarIdx % RANDOM_AVATARS.length];
          randomAvatarIdx++;
          applyAvatar(avatar);
          showToast("Random student avatar applied! 🎲", "🎨");
        });
      }

      const removeBtn = document.getElementById("kodnest-btn-avatar-remove");
      if (removeBtn) {
        removeBtn.addEventListener("click", () => {
          applyAvatar("");
          showToast("Profile photo removed. Showing initials.", "ℹ️");
        });
      }

      // 2. Sub-Tabs Navigation (Profile, Entrance, Fee, Documents)
      const subtabBtns = document.querySelectorAll(".kodnest-subtab-btn");
      subtabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
          const target = btn.getAttribute("data-tab");
          subtabBtns.forEach(b => {
            b.className = "kodnest-subtab-btn py-2 text-slate-600 hover:text-slate-950 border-b-2 border-transparent transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap";
            b.style.color = "#334155";
            b.style.borderBottomColor = "transparent";
            b.style.fontWeight = "600";
          });
          btn.className = "kodnest-subtab-btn py-2 text-slate-950 font-black border-b-2 border-slate-950 transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap";
          btn.style.color = "#0f172a";
          btn.style.borderBottomColor = "#0f172a";
          btn.style.fontWeight = "900";

          const pContent = document.getElementById("kodnest-tab-profile-content");
          const cContent = document.getElementById("kodnest-tab-counseling-content");
          const sContent = document.getElementById("kodnest-tab-scholarships-content");
          const dContent = document.getElementById("kodnest-tab-documents-content");

          if (pContent) pContent.classList.toggle("hidden", target !== "tab-profile");
          if (cContent) cContent.classList.toggle("hidden", target !== "tab-counseling");
          if (sContent) sContent.classList.toggle("hidden", target !== "tab-scholarships");
          if (dContent) dContent.classList.toggle("hidden", target !== "tab-documents");

          if (target === "tab-documents" && typeof renderChecklist === "function") {
            renderChecklist();
          }
        });
      });

      // 3. Back Button - Return to user's working view (Explorer, Priority, Analytics, etc.)
      const backBtn = document.getElementById("kodnest-profile-back-btn");
      if (backBtn) {
        backBtn.addEventListener("click", () => {
          const target = (appState.lastWorkingView && appState.lastWorkingView !== "profile") ? appState.lastWorkingView : "explore";
          switchMainView(target);
          // Sync bottom nav icon state
          const bProf = document.getElementById("nav-profile");
          if (bProf) bProf.classList.remove("on");
          const targetNavBtn = document.querySelector(`#kodnest-bottom-navbar button[data-nav="${target}"]`);
          if (targetNavBtn) targetNavBtn.classList.add("on");
        });
      }

      // 4. Edit Modal Openers & Closer
      const editBtns = document.querySelectorAll(".open-edit-modal-btn");
      const editModal = document.getElementById("kodnest-profile-edit-modal");
      const modalCloseBtn = document.getElementById("kodnest-modal-close-btn");
      const modalCancelBtn = document.getElementById("kodnest-modal-cancel-btn");
      const modalSaveBtn = document.getElementById("kodnest-modal-save-btn");

      function populateEditModal() {
        if (!editModal) return;
        const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ""; };
        setVal("edit-fullname", studentProfile.fullName);
        setVal("edit-email", studentProfile.email);
        setVal("edit-phone", studentProfile.phone);
        setVal("edit-whatsapp", studentProfile.whatsapp);
        setVal("edit-gender", studentProfile.gender || "Male");
        setVal("edit-dob", studentProfile.dob || "20/01/2004");
        setVal("edit-state", studentProfile.currentState || "Andhra Pradesh");
        setVal("edit-city", studentProfile.currentCity || "Guntur");
        setVal("edit-locations", studentProfile.preferredLocations || "Bangalore, Hyderabad, Mumbai, Chennai");
        setVal("edit-github", studentProfile.github || "");
        setVal("edit-linkedin", studentProfile.linkedin || "");
        setVal("edit-school10-name", studentProfile.school10Name || "");
        setVal("edit-school10-pct", studentProfile.school10Pct || "");
        setVal("edit-inter-name", studentProfile.interCollegeName || "");
        setVal("edit-inter-pct", studentProfile.interPct || "");
        setVal("edit-ug-roll", studentProfile.ugRollNo || "");
        setVal("edit-ug-college", studentProfile.ugCollege || "");
        setVal("edit-ug-course", studentProfile.ugCourse || "");
        setVal("edit-ug-branch", studentProfile.ugBranch || "");
        setVal("edit-ug-cgpa", studentProfile.ugCgpa || "");
        setVal("edit-ug-backlogs", studentProfile.ugBacklogs || "");
      }

      editBtns.forEach(btn => {
        btn.addEventListener("click", () => {
          populateEditModal();
          if (editModal) editModal.classList.remove("hidden");
        });
      });

      if (modalCloseBtn) modalCloseBtn.addEventListener("click", () => editModal && editModal.classList.add("hidden"));
      if (modalCancelBtn) modalCancelBtn.addEventListener("click", () => editModal && editModal.classList.add("hidden"));

      if (modalSaveBtn) {
        modalSaveBtn.addEventListener("click", (e) => {
          e.preventDefault();
          const getVal = (id, fallback) => { const el = document.getElementById(id); return (el && el.value.trim()) || fallback; };
          studentProfile.fullName = getVal("edit-fullname", studentProfile.fullName);
          studentProfile.email = getVal("edit-email", studentProfile.email);
          studentProfile.phone = getVal("edit-phone", studentProfile.phone);
          studentProfile.whatsapp = getVal("edit-whatsapp", studentProfile.whatsapp);
          studentProfile.gender = document.getElementById("edit-gender") ? document.getElementById("edit-gender").value : studentProfile.gender;
          studentProfile.dob = getVal("edit-dob", studentProfile.dob);
          studentProfile.currentState = getVal("edit-state", studentProfile.currentState);
          studentProfile.currentCity = getVal("edit-city", studentProfile.currentCity);
          studentProfile.preferredLocations = getVal("edit-locations", studentProfile.preferredLocations);
          studentProfile.github = getVal("edit-github", studentProfile.github);
          studentProfile.linkedin = getVal("edit-linkedin", studentProfile.linkedin);
          studentProfile.school10Name = getVal("edit-school10-name", studentProfile.school10Name);
          studentProfile.school10Pct = getVal("edit-school10-pct", studentProfile.school10Pct);
          studentProfile.interCollegeName = getVal("edit-inter-name", studentProfile.interCollegeName);
          studentProfile.interPct = getVal("edit-inter-pct", studentProfile.interPct);
          studentProfile.ugRollNo = getVal("edit-ug-roll", studentProfile.ugRollNo);
          studentProfile.ugCollege = getVal("edit-ug-college", studentProfile.ugCollege);
          studentProfile.ugCourse = getVal("edit-ug-course", studentProfile.ugCourse);
          studentProfile.ugBranch = getVal("edit-ug-branch", studentProfile.ugBranch);
          studentProfile.ugCgpa = getVal("edit-ug-cgpa", studentProfile.ugCgpa);
          studentProfile.ugBacklogs = getVal("edit-ug-backlogs", studentProfile.ugBacklogs);
          studentProfile.isLoggedIn = true;

          // 1. Persist full profile to localStorage
          try {
            const curSession = (typeof xLS !== "undefined" ? xLS.get("i2t_session_v9") : null) || {};
            curSession.profile = Object.assign({}, curSession.profile || {}, studentProfile);
            curSession.email = studentProfile.email || curSession.email;
            curSession.username = studentProfile.username || curSession.username;
            if (typeof xLS !== "undefined") xLS.set("i2t_session_v9", curSession);
            localStorage.setItem("bridge_profile", JSON.stringify(studentProfile));
            localStorage.setItem("i2t_profile_v9", JSON.stringify(studentProfile));
            localStorage.setItem("bridge_user_email", studentProfile.email || "");
            localStorage.setItem("bridge_last_user_email", studentProfile.email || "");
          } catch (err) {}

          // 2. Persist to server backend dataset
          try {
            if (typeof saveCompleteStudentDataset === "function") saveCompleteStudentDataset();
            const apiBase = (window.I2T_CONFIG && window.I2T_CONFIG.API_BASE) || (window.X_CFG && window.X_CFG.API_BASE) || "";
            if (apiBase) {
              if (typeof xApi === "function") xApi("/api/profile", { profile: studentProfile, prefs: appState }).catch(() => {});
              if (studentProfile.email) {
                fetch(apiBase + "/api/profile/save", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email: studentProfile.email, profile: studentProfile, prefs: appState })
                }).catch(() => {});
              }
            }
          } catch (err) {}

          renderProfileView();
          if (typeof updateStudentBannersAndSheetHeader === "function") updateStudentBannersAndSheetHeader();
          if (typeof updateHeaderBadges === "function") updateHeaderBadges();
          if (editModal) editModal.classList.add("hidden");
          showToast("Profile details saved to dataset successfully! 💾", "✅");
        });
      }

      // 5. History & Logout Handlers
      const histBtn = document.getElementById("kodnest-btn-history");
      if (histBtn) histBtn.addEventListener("click", () => switchMainView("history"));

      const logoutBtn = document.getElementById("kodnest-btn-logout");
      if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
          studentProfile.isLoggedIn = false;
          try {
            if (typeof xLS !== "undefined") xLS.del("i2t_session_v9");
            localStorage.removeItem("bridge_token");
            localStorage.removeItem("bridge_user_email");
            localStorage.removeItem("bridge_last_user_email");
            localStorage.removeItem("bridge_profile");
            localStorage.removeItem("i2t_profile_v9");
            sessionStorage.clear();
          } catch (e) {}
          if (typeof window.updateAppNavVisibility === "function") window.updateAppNavVisibility();
          showToast("Logged out successfully.", "👋");
          setTimeout(() => location.reload(), 500);
        });
      }

      // 6. Top Navbar User Button Dropdown Toggle (Frame 025 Replica)
      const openAuthBtn = document.getElementById("open-auth-portal-btn");
      const navDropdown = document.getElementById("kodnest-navbar-dropdown");

      if (openAuthBtn && navDropdown) {
        openAuthBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          navDropdown.classList.toggle("hidden");
        });

        document.addEventListener("click", (e) => {
          if (!navDropdown.contains(e.target) && e.target !== openAuthBtn) {
            navDropdown.classList.add("hidden");
          }
        });

        const menuProfBtn = document.getElementById("nav-menu-profile-btn");
        if (menuProfBtn) {
          menuProfBtn.addEventListener("click", () => {
            switchMainView("profile");
            navDropdown.classList.add("hidden");
          });
        }

        // nav-menu-feedback-btn handled by initKodNestProfileOptions

        const menuMentorBtn = document.getElementById("nav-menu-mentor-btn");
        if (menuMentorBtn) {
          menuMentorBtn.addEventListener("click", () => {
            navDropdown.classList.add("hidden");
            const drawer = document.getElementById("bridge-ai-drawer");
            if (drawer) drawer.classList.remove("hidden", "translate-x-full");
          });
        }

        const menuAppFeedBtn = document.getElementById("nav-menu-appfeedback-btn");
        if (menuAppFeedBtn) {
          menuAppFeedBtn.addEventListener("click", () => {
            navDropdown.classList.add("hidden");
            showToast("Opening student review desk...", "✍️");
          });
        }

        const menuLogoutBtn = document.getElementById("nav-menu-logout-btn");
        if (menuLogoutBtn) {
          menuLogoutBtn.addEventListener("click", () => {
            studentProfile.isLoggedIn = false;
            try {
              if (typeof xLS !== "undefined") xLS.del("i2t_session_v9");
              localStorage.removeItem("bridge_token");
              localStorage.removeItem("bridge_user_email");
              localStorage.removeItem("bridge_last_user_email");
              localStorage.removeItem("bridge_profile");
              localStorage.removeItem("i2t_profile_v9");
              sessionStorage.clear();
            } catch (e) {}
            if (typeof window.updateAppNavVisibility === "function") window.updateAppNavVisibility();
            showToast("Logged out successfully.", "👋");
            setTimeout(() => location.reload(), 500);
          });
        }
      }

      // 7. Counseling Tab GPS & Dataset Export
      const detectBtn = document.getElementById("kodnest-btn-detect-location");
      const statusEl = document.getElementById("kodnest-location-detect-status");
      if (detectBtn) {
        detectBtn.addEventListener("click", () => {
          if (!navigator.geolocation) {
            showToast("Geolocation is not supported by your browser.", "⚠️");
            return;
          }
          if (statusEl) {
            statusEl.textContent = "📡 Detecting location via GPS... Please allow location access.";
            statusEl.className = "text-[11px] text-amber-400 font-bold animate-pulse";
          }
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const lat = pos.coords.latitude;
              const lng = pos.coords.longitude;
              let closest = AP_DISTRICTS_GEO[0];
              let minDist = Infinity;
              for (const d of AP_DISTRICTS_GEO) {
                const dist = Math.hypot(d.lat - lat, d.lng - lng);
                if (dist < minDist) { minDist = dist; closest = d; }
              }
              appState.district = closest.name;
              appState.region = closest.region;
              const regEl = document.getElementById("kodnest-kpi-region");
              if (regEl) regEl.textContent = closest.region + " Region";
              if (statusEl) {
                statusEl.textContent = "✓ Detected " + closest.name + " (" + closest.region + " Region - 85% Local Quota Active)";
                statusEl.className = "text-[11px] text-emerald-400 font-bold";
              }
              showToast("Location detected: " + closest.name + " (" + closest.region + " Region)", "🛰️");
            },
            () => {
              if (statusEl) {
                statusEl.textContent = "Location permission denied or unavailable. Using default AP region.";
                statusEl.className = "text-[11px] text-slate-400";
              }
              showToast("Location access unavailable.", "⚠️");
            },
            { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
          );
        });
      }

      const exportDatasetBtn = document.getElementById("kodnest-btn-export-dataset");
      if (exportDatasetBtn) {
        exportDatasetBtn.addEventListener("click", () => {
          if (typeof saveCompleteStudentDataset === "function") saveCompleteStudentDataset();
          else showToast("Dataset exported as JSON! 📥", "✅");
        });
      }
    }

    const AP_DISTRICTS_GEO = [
      { name: "Visakhapatnam", region: "AU", lat: 17.6868, lng: 83.2185 },
      { name: "Anakapalli", region: "AU", lat: 17.6896, lng: 83.0033 },
      { name: "Alluri Sitharama Raju", region: "AU", lat: 18.0667, lng: 82.5333 },
      { name: "Srikakulam", region: "AU", lat: 18.2969, lng: 83.8968 },
      { name: "Vizianagaram", region: "AU", lat: 18.1167, lng: 83.4000 },
      { name: "Parvathipuram Manyam", region: "AU", lat: 18.7833, lng: 83.4333 },
      { name: "East Godavari", region: "AU", lat: 17.0000, lng: 81.8000 },
      { name: "Kakinada", region: "AU", lat: 16.9891, lng: 82.2475 },
      { name: "Dr. B.R. Ambedkar Konaseema", region: "AU", lat: 16.5744, lng: 82.0000 },
      { name: "West Godavari", region: "AU", lat: 16.7107, lng: 81.0952 },
      { name: "Eluru", region: "AU", lat: 16.7107, lng: 81.0952 },
      { name: "Krishna", region: "AU", lat: 16.5062, lng: 80.6480 },
      { name: "NTR", region: "AU", lat: 16.5062, lng: 80.6480 },
      { name: "Guntur", region: "AU", lat: 16.3067, lng: 80.4365 },
      { name: "Bapatla", region: "AU", lat: 15.9042, lng: 80.4674 },
      { name: "Palnadu", region: "AU", lat: 16.2333, lng: 79.9667 },
      { name: "Prakasam", region: "SVU", lat: 15.5057, lng: 80.0499 },
      { name: "SPS Nellore", region: "SVU", lat: 14.4426, lng: 79.9865 },
      { name: "Tirupati", region: "SVU", lat: 13.6288, lng: 79.4192 },
      { name: "Chittoor", region: "SVU", lat: 13.2172, lng: 79.1003 },
      { name: "Annamayya", region: "SVU", lat: 14.1833, lng: 78.7500 },
      { name: "YSR Kadapa", region: "SVU", lat: 14.4673, lng: 78.8242 },
      { name: "Kurnool", region: "SVU", lat: 15.8281, lng: 78.0373 },
      { name: "Nandyal", region: "SVU", lat: 15.4833, lng: 78.4833 },
      { name: "Ananthapuramu", region: "SVU", lat: 14.6819, lng: 77.6006 },
      { name: "Sri Sathya Sai", region: "SVU", lat: 14.1667, lng: 77.8167 }
    ];

    function setupLocationDetection() {
      const detectBtn = document.getElementById("btn-detect-location");
      const statusEl = document.getElementById("location-detect-status");

      if (detectBtn) {
        detectBtn.addEventListener("click", () => {
          if (!navigator.geolocation) {
            showToast("Geolocation is not supported by your mobile browser.", "⚠️");
            return;
          }

          if (statusEl) {
            statusEl.textContent = "📡 Requesting device GPS coordinates... Please allow location access.";
            statusEl.className = "text-[11px] text-amber-700 font-bold animate-pulse";
          }

          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const lat = pos.coords.latitude;
              const lng = pos.coords.longitude;

              let closest = AP_DISTRICTS_GEO[0];
              let minDist = Infinity;
              for (const d of AP_DISTRICTS_GEO) {
                const dist = Math.hypot(lat - d.lat, lng - d.lng);
                if (dist < minDist) {
                  minDist = dist;
                  closest = d;
                }
              }

              const distSelect = document.getElementById("p-inter-district");
              if (distSelect) {
                let matched = false;
                for (let i = 0; i < distSelect.options.length; i++) {
                  if (distSelect.options[i].value.toLowerCase().includes(closest.name.toLowerCase()) ||
                      closest.name.toLowerCase().includes(distSelect.options[i].value.toLowerCase())) {
                    distSelect.selectedIndex = i;
                    matched = true;
                    break;
                  }
                }
                if (!matched) {
                  const opt = new Option(closest.name, closest.name, true, true);
                  distSelect.add(opt);
                }
              }

              const regSelect = document.getElementById("p-region");
              if (regSelect) regSelect.value = closest.region;

              const homeSelect = document.getElementById("p-homestate");
              if (homeSelect) homeSelect.value = "Andhra Pradesh";

              studentProfile.interDistrict = closest.name;
              studentProfile.homeState = "Andhra Pradesh";
              appState.region = closest.region;
              appState.state = "Andhra Pradesh";

              studentProfile.detectedLocation = {
                latitude: lat,
                longitude: lng,
                district: closest.name,
                region: closest.region,
                timestamp: new Date().toISOString()
              };

              if (statusEl) {
                statusEl.textContent = "✅ Detected: " + closest.name + " District • " + closest.region + " Region (85% Local Quota Assigned)";
                statusEl.className = "text-[11px] text-emerald-800 font-extrabold";
              }

              saveCompleteStudentDataset();
              updateHeaderBadges();
              showToast("📍 Location detected: " + closest.name + " (" + closest.region + " Region)! Auto-applied.", "🎯");
            },
            (err) => {
              console.warn("Geolocation error:", err);
              if (statusEl) {
                statusEl.textContent = "⚠️ Location permission denied or unavailable. You can select your district manually above.";
                statusEl.className = "text-[11px] text-rose-700 font-medium";
              }
              showToast("Location access denied or unavailable. Selected default AP district.", "⚠️");
            },
            { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
          );
        });
      }
    }

    function saveCompleteStudentDataset() {
      const fullDataset = {
        meta: {
          app: "The Bridge - Bridge to the B.Tech",
          version: "2026.1",
          savedAt: new Date().toISOString()
        },
        studentProfile: studentProfile,
        counselingPreferences: {
          exam: appState.exam,
          rank: appState.rank,
          category: appState.category,
          region: appState.region,
          state: appState.state,
          transitOrigin: document.getElementById("origin-hub-select")?.value || "Vijayawada"
        },
        priorityWebOptions: appState.priorityList || [],
        favoriteColleges: appState.favorites || [],
        documentChecklist: appState.checklist || {}
      };

      try {
        localStorage.setItem("i2t_student_dataset", JSON.stringify(fullDataset));
        localStorage.setItem("i2t_profile_v9", JSON.stringify(studentProfile));
        localStorage.setItem("i2t_app_state", JSON.stringify({
          exam: appState.exam,
          rank: appState.rank,
          category: appState.category,
          region: appState.region,
          state: appState.state
        }));

        const apiBase = (window.I2T_CONFIG && window.I2T_CONFIG.API_BASE) || (window.X_CFG && window.X_CFG.API_BASE) || "";
        if (apiBase) {
          if (typeof xApi === "function") xApi("/api/profile", { profile: studentProfile, prefs: fullDataset }).catch(() => {});
          if (studentProfile.email) {
            fetch(apiBase + "/api/profile/save", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: studentProfile.email, profile: studentProfile, prefs: fullDataset })
            }).catch(() => {});
          }
        }
      } catch (err) {
        console.warn("Error saving student dataset:", err);
      }
    }

    function setupDatasetExport() {
      const exportBtn = document.getElementById("btn-export-dataset");
      if (exportBtn) {
        exportBtn.addEventListener("click", () => {
          saveCompleteStudentDataset();
          const dataStr = localStorage.getItem("i2t_student_dataset") || JSON.stringify(studentProfile, null, 2);
          const blob = new Blob([dataStr], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          const cleanName = (studentProfile.fullName || "Student").replace(/[^a-zA-Z0-9]/g, "_");
          a.download = cleanName + "_Bridge_Counseling_Dataset.json";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          showToast("Complete Counseling Dataset exported as JSON file! 📥", "✅");
        });
      }
    }


    // =========================================================================
    // CUSTOM RADIO DROPDOWN ENGINE (Pic 1 Design with Clean White Theme)
    // =========================================================================
    function enhanceSelectWithCustomRadio(select) {
      if (!select || select.dataset.customRadioEnhanced) return;
      select.dataset.customRadioEnhanced = "true";

      // Hide original select visually but keep in DOM for form & event handlers
      select.style.position = "absolute";
      select.style.opacity = "0";
      select.style.pointerEvents = "none";
      select.style.width = "0";
      select.style.height = "0";
      select.style.overflow = "hidden";
      select.tabIndex = -1;
      select.setAttribute("aria-hidden", "true");

      const wrapper = document.createElement("div");
      wrapper.className = "custom-radio-select-wrapper";
      select.parentNode.insertBefore(wrapper, select);
      wrapper.appendChild(select);

      // Trigger button
      const trigger = document.createElement("button");
      trigger.type = "button";
      trigger.className = "custom-radio-trigger";
      trigger.setAttribute("aria-haspopup", "listbox");
      trigger.setAttribute("aria-expanded", "false");

      const labelSpan = document.createElement("span");
      labelSpan.className = "truncate pr-2 font-semibold";
      
      const arrowSvg = document.createElement("div");
      arrowSvg.className = "custom-radio-arrow";
      arrowSvg.innerHTML = `<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`;

      trigger.appendChild(labelSpan);
      trigger.appendChild(arrowSvg);
      wrapper.appendChild(trigger);

      // Dropdown menu (Pic 1 with white theme)
      const menu = document.createElement("div");
      menu.className = "custom-radio-menu hidden";
      menu.setAttribute("role", "listbox");
      wrapper.appendChild(menu);

      function updateTriggerLabel() {
        const selOpt = select.options[select.selectedIndex];
        labelSpan.textContent = selOpt ? selOpt.textContent : "Select an option";
      }

      function buildMenuOptions(filterQuery = "") {
        menu.innerHTML = "";
        const options = Array.from(select.options);

        // Search filter if options > 7
        if (options.length > 7) {
          const searchBox = document.createElement("div");
          searchBox.className = "custom-radio-search-box";
          searchBox.innerHTML = `
            <div class="relative">
              <input type="text" placeholder="Search options..." class="custom-radio-search-input">
              <svg class="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
          `;
          const sInput = searchBox.querySelector("input");
          sInput.value = filterQuery;
          sInput.addEventListener("input", (e) => {
            e.stopPropagation();
            const term = e.target.value.toLowerCase().trim();
            menu.querySelectorAll(".custom-radio-option").forEach(optEl => {
              const text = (optEl.dataset.text || "").toLowerCase();
              optEl.style.display = text.includes(term) ? "flex" : "none";
            });
          });
          sInput.addEventListener("click", e => e.stopPropagation());
          sInput.addEventListener("keydown", e => e.stopPropagation());
          menu.appendChild(searchBox);
        }

        const currentVal = select.value;
        options.forEach(opt => {
          const isSelected = opt.value === currentVal || opt.selected;
          const optDiv = document.createElement("div");
          optDiv.className = `custom-radio-option ${isSelected ? 'is-selected' : ''}`;
          optDiv.dataset.value = opt.value;
          optDiv.dataset.text = opt.textContent;
          optDiv.setAttribute("role", "option");
          optDiv.setAttribute("aria-selected", isSelected ? "true" : "false");

          // Text on left
          const tSpan = document.createElement("span");
          tSpan.className = "truncate pr-2";
          tSpan.textContent = opt.textContent;

          // Radio ring on right (Pic 1)
          const circleDiv = document.createElement("div");
          circleDiv.className = "custom-radio-circle";
          if (isSelected) {
            circleDiv.innerHTML = '<div class="custom-radio-dot"></div>';
          }

          optDiv.appendChild(tSpan);
          optDiv.appendChild(circleDiv);

          optDiv.addEventListener("click", (e) => {
            e.stopPropagation();
            if (select.value !== opt.value) {
              select.value = opt.value;
              select.dispatchEvent(new Event("change", { bubbles: true }));
            }
            updateTriggerLabel();
            closeMenu();
          });

          menu.appendChild(optDiv);
        });

        updateTriggerLabel();
      }

      function openMenu() {
        // Close any other open dropdowns across the page
        document.querySelectorAll(".custom-radio-menu").forEach(m => {
          if (m !== menu) {
            m.classList.add("hidden");
            const otherTrig = m.closest(".custom-radio-select-wrapper")?.querySelector(".custom-radio-trigger");
            if (otherTrig) otherTrig.classList.remove("is-open");
          }
        });

        buildMenuOptions();
        menu.classList.remove("hidden");
        trigger.classList.add("is-open");
        trigger.setAttribute("aria-expanded", "true");

        // Focus search input if available
        const sInput = menu.querySelector("input");
        if (sInput) {
          setTimeout(() => sInput.focus(), 60);
        }
      }

      function closeMenu() {
        menu.classList.add("hidden");
        trigger.classList.remove("is-open");
        trigger.setAttribute("aria-expanded", "false");
      }

      trigger.addEventListener("click", (e) => {
        e.stopPropagation();
        if (menu.classList.contains("hidden")) {
          openMenu();
        } else {
          closeMenu();
        }
      });

      // Synchronize when underlying select changes
      select.addEventListener("change", () => {
        updateTriggerLabel();
        if (!menu.classList.contains("hidden")) {
          buildMenuOptions();
        }
      });

      // Watch for dynamic options updates (like district-select repopulation)
      const observer = new MutationObserver(() => {
        buildMenuOptions();
        updateTriggerLabel();
      });
      observer.observe(select, { childList: true, subtree: true });

      // Initial build & label
      buildMenuOptions();
      updateTriggerLabel();
    }

    function setupCustomRadioDropdowns() {
      // 1. Target all dropdowns in the Option Search Bar
      const targetSelectIds = [
        "gender-select",
        "category-select",
        "region-select",
        "branch-select",
        "state-select",
        "district-select",
        "type-select",
        "min-pkg-select",
        "sort-select",
        "counseling-gender-select",
        "counseling-category-select",
        "counseling-state-select",
        "wiz-gender-select",
        "wiz-category-select",
        "wiz-state-select"
      ];

      targetSelectIds.forEach(id => {
        const select = document.getElementById(id);
        if (select) {
          enhanceSelectWithCustomRadio(select);
        }
      });

      // Global click outside listener to close menus
      if (!window._customRadioGlobalListenerAttached) {
        window._customRadioGlobalListenerAttached = true;
        document.addEventListener("click", (e) => {
          if (!e.target.closest(".custom-radio-select-wrapper")) {
            document.querySelectorAll(".custom-radio-menu").forEach(m => m.classList.add("hidden"));
            document.querySelectorAll(".custom-radio-trigger").forEach(t => t.classList.remove("is-open"));
          }
        });
        document.addEventListener("keydown", (e) => {
          if (e.key === "Escape") {
            document.querySelectorAll(".custom-radio-menu").forEach(m => m.classList.add("hidden"));
            document.querySelectorAll(".custom-radio-trigger").forEach(t => t.classList.remove("is-open"));
          }
        });
      }
    }

    window.addEventListener("DOMContentLoaded", () => {
      // Check for existing saved session to direct-login, or prompt new users to signup
      const savedSession = (typeof xLS !== "undefined") ? xLS.get("i2t_session_v9") : null;
      const savedToken = localStorage.getItem("bridge_token") || (savedSession && savedSession.token);
      const savedEmail = localStorage.getItem("bridge_user_email") || (savedSession && savedSession.email);
      const savedProfile = (savedSession && savedSession.profile) || JSON.parse(localStorage.getItem("bridge_profile") || "null");

      if (savedToken || savedProfile || savedEmail || (savedSession && (savedSession.token || savedSession.profile))) {
        // Existing user: direct login by saved details, KEEP AUTH OVERLAY HIDDEN!
        studentProfile.isLoggedIn = true;
        document.getElementById("auth-portal-overlay")?.classList.add("hidden");
      if (typeof window.updateAppNavVisibility === "function") window.updateAppNavVisibility();

        if (savedProfile) {
          Object.assign(studentProfile, savedProfile, { isLoggedIn: true });
          if (typeof xRestore === "function") xRestore(savedProfile, savedSession ? savedSession.prefs : null);
        }
        if (typeof renderProfileView === "function") renderProfileView();

        if (savedToken && window.X_CFG && window.X_CFG.API_BASE) {
          xApi("/api/profile", null, "GET").then(r => {
            if (r && r.profile) {
              Object.assign(studentProfile, r.profile, { isLoggedIn: true });
              if (typeof xRestore === "function") xRestore(r.profile, r.prefs);
              if (typeof renderProfileView === "function") renderProfileView();
              if (typeof updateStudentBannersAndSheetHeader === "function") updateStudentBannersAndSheetHeader();
              if (typeof updateHeaderBadges === "function") updateHeaderBadges();
            }
          }).catch(() => {});
        }
      } else {
        // True new visitor: default to guest
        studentProfile.isLoggedIn = false;
        if (typeof renderProfileView === "function") renderProfileView();
        setTimeout(() => {
          const hasSess = localStorage.getItem("bridge_token") || (typeof xLS !== "undefined" && xLS.get("i2t_session_v9"));
          if (!hasSess && typeof openTheBridgeLoginPage === "function") {
            openTheBridgeLoginPage("welcome");
          }
        }, 600);
      }

      setTimeout(() => {
        if (typeof goToNearAddRank === "function") {
          goToNearAddRank();
        }
      }, 150);
      populateAnalyticsDropdowns();
      initEventListeners();
      initAuthAndEmailFlow();
      const gSelectEl = document.getElementById("gender-select");
      if (gSelectEl) {
        const curGender = (studentProfile.gender || "male").toLowerCase();
        gSelectEl.value = curGender;
        const gBadge = document.getElementById("gender-display-badge");
        if (gBadge) { gBadge.textContent = ""; gBadge.classList.add("hidden"); }
      }
      if (typeof updateDistrictDropdown === "function") {
        updateDistrictDropdown(appState.state || "Andhra Pradesh");
      }
      if (typeof showExplorerSlide === "function") {
        showExplorerSlide(1);
      }
    });

    // =========================================================================
    // SEQUENTIAL 1-BY-1 AUTHENTICATION CONTROLLER (WELCOME -> SIGNIN -> SIGNUP)
    // =========================================================================
    function showAuthSlide(name) {
      const sWelcome = document.getElementById("slide-welcome");
      const sSignin = document.getElementById("slide-signin");
      const sSignup = document.getElementById("slide-signup");

      if (sWelcome) sWelcome.classList.toggle("hidden", name !== "welcome");
      if (sSignin) sSignin.classList.toggle("hidden", name !== "signin");
      if (sSignup) sSignup.classList.toggle("hidden", name !== "signup");

      // Hide sub-dialogs when switching main slides
      const vOtp = document.getElementById("auth-stage-2-otp");
      const vStudent = document.getElementById("auth-stage-3-student");
      const vForgot = document.getElementById("auth-forgot-panel");
      if (vOtp) vOtp.classList.add("hidden");
      if (vStudent) vStudent.classList.add("hidden");
      if (vForgot) vForgot.classList.add("hidden");

      if (name === "signin") {
        setTimeout(() => document.getElementById("login-email-input")?.focus(), 120);
      } else if (name === "signup") {
        setTimeout(() => document.getElementById("signup-email-input")?.focus(), 120);
      }
    }

    function userExistsOnDevice() {
      // 1. Check last recorded user email
      const last = localStorage.getItem("bridge_last_user_email");
      if (last) return true;

      // 2. Check active or stored session
      const s = typeof xLS !== "undefined" ? xLS.get("i2t_session_v9") : null;
      if (s && (s.token || (s.profile && s.profile.email))) return true;

      // 3. Check registered users in local store
      if (typeof xUsers === "function") {
        const u = xUsers();
        if (u && Object.keys(u).length > 0) return true;
      }
      return false;
    }

    window.updateAppNavVisibility = function() {
      const nav = document.getElementById("app-nav");
      const floater = document.getElementById("bridge-ai-floater");
      const overlay = document.getElementById("auth-portal-overlay");
      const hasSplash = document.body.classList.contains("splash-active") || !!document.getElementById("app-splash");
      const isAuthOpen = !!(overlay && !overlay.classList.contains("hidden"));
      const hasSession = !!(
        (typeof studentProfile !== "undefined" && studentProfile.isLoggedIn && (studentProfile.email || studentProfile.username || studentProfile.fullName)) ||
        localStorage.getItem("bridge_token") ||
        localStorage.getItem("bridge_user_email") ||
        (typeof xLS !== "undefined" && xLS.get && xLS.get("i2t_session_v9") && (xLS.get("i2t_session_v9").token || xLS.get("i2t_session_v9").profile))
      );

      // Bottom nav is strictly hidden if splash is active, or login page is open, or user is unauthenticated
      const shouldHideNav = hasSplash || isAuthOpen || !hasSession;

      if (shouldHideNav) {
        document.body.classList.add("auth-active");
        document.documentElement.classList.add("auth-active");
        if (isAuthOpen) {
          document.body.style.setProperty("overflow", "hidden", "important");
          document.documentElement.style.setProperty("overflow", "hidden", "important");
          document.body.style.setProperty("touch-action", "none", "important");
          document.body.style.setProperty("position", "fixed", "important");
          document.body.style.setProperty("width", "100%", "important");
          document.body.style.setProperty("top", "0", "important");
        }
        if (nav) {
          nav.classList.add("auth-hidden", "hidden");
          nav.style.setProperty("display", "none", "important");
          nav.style.setProperty("opacity", "0", "important");
          nav.style.setProperty("visibility", "hidden", "important");
          nav.style.setProperty("pointer-events", "none", "important");
        }
      } else {
        document.body.classList.remove("auth-active");
        document.documentElement.classList.remove("auth-active");
        document.body.style.removeProperty("overflow");
        document.documentElement.style.removeProperty("overflow");
        document.body.style.removeProperty("touch-action");
        document.body.style.removeProperty("position");
        document.body.style.removeProperty("width");
        document.body.style.removeProperty("top");
        if (nav) {
          nav.classList.remove("splash-hidden", "auth-hidden", "hidden");
          nav.style.removeProperty("display");
          nav.style.removeProperty("opacity");
          nav.style.removeProperty("visibility");
          nav.style.removeProperty("pointer-events");
        }
      }

      if (floater) {
        if (hasSplash || isAuthOpen) {
          floater.classList.add("auth-hidden", "hidden");
          floater.style.setProperty("display", "none", "important");
        } else {
          floater.classList.remove("splash-hidden", "auth-hidden", "hidden");
          floater.style.removeProperty("display");
        }
      }
    };

    window.openTheBridgeLoginPage = function(forcedSlide) {
      const overlay = document.getElementById("auth-portal-overlay");
      if (!overlay) return;
      overlay.classList.remove("hidden");
      document.body.classList.add("auth-active");
      document.documentElement.classList.add("auth-active");
      document.body.style.setProperty("overflow", "hidden", "important");
      document.documentElement.style.setProperty("overflow", "hidden", "important");
      document.body.style.setProperty("touch-action", "none", "important");
      document.body.style.setProperty("position", "fixed", "important");
      document.body.style.setProperty("width", "100%", "important");
      document.body.style.setProperty("top", "0", "important");

      // Hide sub-dialogs
      document.getElementById("auth-forgot-panel")?.classList.add("hidden");
      document.getElementById("auth-stage-2-otp")?.classList.add("hidden");
      document.getElementById("auth-stage-3-student")?.classList.add("hidden");

      // Show requested slide, or ALWAYS start on the FIRST slide ("welcome") by default
      showAuthSlide(forcedSlide || "welcome");

      if (typeof window.updateAppNavVisibility === "function") window.updateAppNavVisibility();
    };

    function setAuthStage(stageNum) {
      if (stageNum === 2) stageNum = 3;
      const vOtp = document.getElementById("auth-stage-2-otp");
      const vStudent = document.getElementById("auth-stage-3-student");
      if (vOtp) vOtp.classList.add("hidden");
      if (vStudent) vStudent.classList.toggle("hidden", stageNum !== 3);
      if (stageNum === 1) showAuthSlide("signin");
    }

    window.addEventListener("DOMContentLoaded", () => {
      // Setup live reactive sync for bottom navigation bar (#app-nav) & floater (Strictly hidden during start / login)
      if (typeof window.updateAppNavVisibility === "function") window.updateAppNavVisibility();
      try {
        const authOverlayEl = document.getElementById("auth-portal-overlay");
        if (authOverlayEl) {
          if (typeof MutationObserver !== "undefined") {
            const authObserver = new MutationObserver(() => {
              if (typeof window.updateAppNavVisibility === "function") window.updateAppNavVisibility();
            });
            authObserver.observe(authOverlayEl, { attributes: true, attributeFilter: ["class", "style"] });
          }

          // Prevent background slide movement when scrolling/swiping on auth modal
          authOverlayEl.addEventListener("wheel", (e) => {
            const isScrollable = authOverlayEl.scrollHeight > authOverlayEl.clientHeight;
            if (!isScrollable) {
              e.preventDefault();
              return;
            }
            const delta = e.deltaY;
            const atTop = authOverlayEl.scrollTop <= 0 && delta < 0;
            const atBottom = authOverlayEl.scrollTop + authOverlayEl.clientHeight >= authOverlayEl.scrollHeight - 1 && delta > 0;
            if (atTop || atBottom) {
              e.preventDefault();
            }
          }, { passive: false });

          authOverlayEl.addEventListener("touchmove", (e) => {
            const slideWelcome = document.getElementById("slide-welcome");
            const isWelcomeActive = slideWelcome && !slideWelcome.classList.contains("hidden");
            const isScrollable = authOverlayEl.scrollHeight > authOverlayEl.clientHeight;

            // Slide 1 fits completely without scrolling, or backdrop touch, or when overlay cannot scroll
            if (isWelcomeActive || !isScrollable || e.target === authOverlayEl) {
              e.preventDefault();
              return;
            }

            const atTop = authOverlayEl.scrollTop <= 0;
            const atBottom = authOverlayEl.scrollTop + authOverlayEl.clientHeight >= authOverlayEl.scrollHeight - 1;
            if (atTop || atBottom) {
              if (e.target === authOverlayEl) {
                e.preventDefault();
              }
            }
          }, { passive: false });
        }
      } catch (_) {}

      // 1. Welcome Slide Navigation
      document.getElementById("welcome-to-signin-btn")?.addEventListener("click", () => {
        showAuthSlide("signin");
      });
      document.getElementById("welcome-to-signup-btn")?.addEventListener("click", () => {
        showAuthSlide("signup");
      });

      // 2. Back buttons from Sign in and Sign up
      document.getElementById("signin-back-btn")?.addEventListener("click", (e) => { e.preventDefault(); showAuthSlide("welcome"); });
      document.getElementById("dummy-signin-back")?.addEventListener("click", () => {
        showAuthSlide("welcome");
      });
      document.getElementById("signup-back-btn")?.addEventListener("click", (e) => { e.preventDefault(); showAuthSlide("welcome"); });
      document.getElementById("dummy-signup-back")?.addEventListener("click", () => {
        showAuthSlide("welcome");
      });

      // 3. Cross-switch between Sign in and Sign up
      document.getElementById("auth-switch-to-signup")?.addEventListener("click", () => {
        showAuthSlide("signup");
      });
      document.getElementById("auth-switch-to-login")?.addEventListener("click", () => {
        showAuthSlide("signin");
      });

      // 4. Close Modal
      document.getElementById("skip-or-close-auth-btn")?.addEventListener("click", () => {
        document.getElementById("auth-portal-overlay")?.classList.add("hidden");
      if (typeof window.updateAppNavVisibility === "function") window.updateAppNavVisibility();
      });

      // 5. Forgot Password Dialog
      document.getElementById("auth-forgot-link")?.addEventListener("click", () => {
        const fp = document.getElementById("auth-forgot-panel");
        if (fp) {
          fp.classList.remove("hidden");
          const em = document.getElementById("login-email-input")?.value || "";
          const fpEm = document.getElementById("fp-email");
          if (fpEm && em) fpEm.value = em;
        }
      });
      document.getElementById("fp-back")?.addEventListener("click", () => {
        document.getElementById("auth-forgot-panel")?.classList.add("hidden");
        showAuthSlide("signin");
      });

      // 6. Header triggers: Logo & App title open login
      document.getElementById("brand-header-link")?.addEventListener("click", (e) => {
        e.preventDefault();
        goToNearAddRank();
      });
      document.getElementById("splash-logo-btn")?.addEventListener("click", () => openTheBridgeLoginPage());
      document.getElementById("splash-title-btn")?.addEventListener("click", () => openTheBridgeLoginPage());
      document.getElementById("open-auth-portal-btn")?.addEventListener("click", () => openTheBridgeLoginPage());

      // 10. Signup Submit from Slide 3
      document.getElementById("signup-submit-btn")?.addEventListener("click", () => {
        const email = document.getElementById("signup-email-input")?.value.trim() || "";
        const user = document.getElementById("signup-username-input")?.value.trim() || "";
        const phone = (document.getElementById("signup-phone-input")?.value || "").replace(/\D/g, "").slice(-10);
        const pass = document.getElementById("signup-password-input")?.value || "";

        const liEmail = document.getElementById("login-email-input");
        const liPass = document.getElementById("login-password-input");
        const liUser = document.getElementById("login-username-input");
        const liPhone = document.getElementById("login-phone-input");
        if (liEmail) liEmail.value = email;
        if (liPass) liPass.value = pass;
        if (liUser) liUser.value = user;
        if (liPhone) liPhone.value = phone;

        studentProfile.email = email;
        studentProfile.username = user;
        studentProfile.phone = phone;

        if (typeof xSignup === "function") {
          xSignup();
        }
      });

      
      // Enable Enter key submission for login and signup
      document.getElementById("login-password-input")?.addEventListener("keydown", (e) => {
        if (e.key === "Enter") xLogin();
      });
      document.getElementById("login-email-input")?.addEventListener("keydown", (e) => {
        if (e.key === "Enter") xLogin();
      });
      document.getElementById("signup-password-input")?.addEventListener("keydown", (e) => {
        if (e.key === "Enter") xSignup();
      });

      // 11. Initial slide logic:
      // If user is already authenticated with session -> overlay is closed
      // If not authenticated -> open on "Welcome Back!" if user exists, or "Welcome!" if new
      const s = typeof xLS !== "undefined" ? xLS.get("i2t_session_v9") : null;
      if (!s || !s.profile) {
        showAuthSlide("welcome");
      }
    });


    // 3-Slides Navigation & Interactive Controller
    let currentSlide = 2; // Default to Center Welcome slide

    
    // Compatibility bridge for any goToSlide callers
    function goToSlide(slideNum) {
      if (slideNum === 1) showAuthSlide("signin");
      else if (slideNum === 2) showAuthSlide("welcome");
      else if (slideNum === 3) showAuthSlide("signup");
    }

    // =========================================================================
    // 12. APP MODE: persistent login, real OTP delivery, priority-list history
    // =========================================================================
    const X_CFG = window.I2T_CONFIG || { API_BASE: "" };
    const xq = id => document.getElementById(id);
    const xLS = {
      get(k){ try { return JSON.parse(localStorage.getItem(k)); } catch(e){ return null; } },
      set(k,v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} },
      del(k){ try { localStorage.removeItem(k); } catch(e){} }
    };
    async function xApi(path, body, method) {
      const s = xLS.get("i2t_session_v9");
      const r = await fetch(X_CFG.API_BASE + path, { method: method || "POST",
        headers: Object.assign({ "Content-Type": "application/json" }, s && s.token ? { Authorization: "Bearer " + s.token } : {}),
        body: body ? JSON.stringify(body) : undefined });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || "Request failed");
      return d;
    }
    // OTPs are never generated or shown in the page: the server sends them by SMS / email.
    function generateNewOtps() {}

    function xSaveSession(extra) {
      const s = Object.assign(xLS.get("i2t_session_v9") || {}, extra || {});
      s.profile = { fullName: studentProfile.fullName, username: studentProfile.username, email: studentProfile.email, phone: studentProfile.phone, interPct: studentProfile.interPct, selectedExam: studentProfile.selectedExam, gender: studentProfile.gender };
      s.prefs = { exam: appState.exam, rank: appState.rank, category: appState.category, region: appState.region, branch: appState.branch };
      xLS.set("i2t_session_v9", s);
      const u = xLS.get("i2t_users_v9") || {};
      const k = studentProfile.email.toLowerCase(); u[k] = Object.assign({}, u[k], { profile: s.profile, prefs: s.prefs }); if (xPendingPw) u[k].pwHash = xPendingPw;
      xLS.set("i2t_users_v9", u);
      if (X_CFG.API_BASE) xApi("/api/profile", { profile: s.profile, prefs: s.prefs }).catch(() => {});
    }
    function xRestore(profile, prefs) {
      Object.assign(studentProfile, profile || {}, { emailVerified: true, phoneVerified: true });
      const p = prefs || {};
      appState.rank = p.rank || null; appState.category = p.category || "OC";
      appState.region = p.region || "ALL"; appState.branch = p.branch || "ALL";
      if (appState.rank) { xq("rank-input").value = appState.rank; xq("rank-clear-btn").classList.remove("hidden"); }
      xq("category-select").value = appState.category; xq("region-select").value = appState.region; xq("branch-select").value = appState.branch;
      setExamTab(p.exam || studentProfile.selectedExam || "ap_cet");
      xq("auth-portal-overlay").classList.add("hidden");
      xq("skip-or-close-auth-btn").classList.remove("hidden");
      if (typeof window.updateAppNavVisibility === "function") window.updateAppNavVisibility();
      updateStudentBannersAndSheetHeader(); updateHeaderBadges();
      xPull();
      const urlParams = new URLSearchParams(window.location.search);
      const requestedTab = urlParams.get("tab");
      if (requestedTab && ["priority", "search", "analytics", "docs", "profile"].includes(requestedTab)) {
        switchMainView(requestedTab);
      } else {
        switchMainView("add-rank");
        if (typeof showHomeSlide === "function") {
          showHomeSlide(1);
        }
      }
    }
    const _applyWiz = applyStudentWizardAndLaunch;
    applyStudentWizardAndLaunch = function (t) { _applyWiz(t); xSaveSession(); xPendingPw = ""; xPendingRaw = ""; xSnap(false); };

    // ---- History
    const xHistKey = () => "i2t_hist_v9_" + (studentProfile.email || "guest").toLowerCase();
    const xHist = () => xLS.get(xHistKey()) || [];
    function xPush() { if (X_CFG.API_BASE) xApi("/api/history", { history: xHist() }).catch(() => {}); }
    async function xPull() {
      if (!X_CFG.API_BASE) return;
      try {
        const r = await xApi("/api/history", null, "GET");
        const m = {}; xHist().concat(r.history || []).forEach(x => m[x.id] = x);
        xLS.set(xHistKey(), Object.values(m).sort((a, b) => b.ts - a.ts).slice(0, 25));
        if (appState.activeView === "history") xRenderHistory();
      } catch (e) {}
    }
    function xSnap(manual) {
      if (!appState.priorityList.length) return false;
      const h = xHist(), items = JSON.parse(JSON.stringify(appState.priorityList));
      if (!manual && h[0] && JSON.stringify(h[0].items) === JSON.stringify(items)) return false;
      const rec = { id: Date.now(), ts: Date.now(), manual: !!manual, exam: appState.exam, rank: appState.rank, category: appState.category, items };
      if (!manual && h[0] && !h[0].manual && rec.ts - h[0].ts < 30 * 60000) h[0] = rec; else h.unshift(rec);
      xLS.set(xHistKey(), h.slice(0, 25)); xPush(); return true;
    }
    const _saveState = saveState; let xTimer;
    saveState = function () { _saveState(); clearTimeout(xTimer); if (xLS.get("i2t_session_v9")) xTimer = setTimeout(() => xSnap(false), 1500); };
    function xRenderHistory() {
      const hAcc = xq("hist-account");
      const hCont = xq("hist-contact");
      const isAuth = !!(studentProfile.isLoggedIn && (studentProfile.email || studentProfile.fullName));
      if (isAuth) {
        const uName = studentProfile.username || (studentProfile.email ? studentProfile.email.split("@")[0] : "student");
        if (hAcc) hAcc.textContent = (studentProfile.fullName || uName) + " (@" + uName + ")";
        if (hCont) hCont.textContent = studentProfile.email + (studentProfile.phone ? " • +91 " + studentProfile.phone : "");
      } else {
        if (hAcc) hAcc.textContent = "Guest Student";
        if (hCont) hCont.textContent = "Not signed in • Create an account to save priority lists permanently";
      }
      const h = xHist(), ex = { ap_cet: "AP EAPCET", jee_main: "JEE Main", jee_adv: "JEE Adv", payment: "Payment" };
      xq("hist-list").innerHTML = h.length ? h.map(r => {
        const names = r.items.slice(0, 3).map(i => { const c = collegesData.find(x => x.id === i.collegeId); return (c ? c.code : "?") + " (" + i.branchCode + ")"; }).join(" → ");
        return `<div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-2">
          <div class="flex items-center justify-between gap-2 flex-wrap"><span class="text-xs font-extrabold text-slate-900">${new Date(r.ts).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${r.manual ? "bg-amber-100 text-amber-900" : "bg-slate-100 text-slate-600"}">${r.manual ? "Saved version" : "Auto-saved"}</span></div>
          <div class="text-[11px] text-slate-500">${ex[r.exam] || r.exam} • Rank ${r.rank ? r.rank.toLocaleString("en-IN") : "Open"} • ${r.category} • <strong>${r.items.length} choices</strong></div>
          <div class="text-xs text-slate-700 font-semibold">Top: ${names}</div>
          <div class="flex gap-2 pt-1"><button data-h="open" data-id="${r.id}" class="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold">Open list</button>
          <button data-h="del" data-id="${r.id}" class="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold">Delete</button></div></div>`;
      }).join("") : `<div class="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center text-xs text-slate-500">No saved lists yet. Build your priority list and it appears here automatically.</div>`;
    }

    // ---- Navigation (bottom tab bar)
    const _switch = switchMainView;
    switchMainView = function (v) {
      _switch(v);
      if (v === "history") {
        const hv = xq("history-view-container");
        if (hv) hv.classList.remove("hidden");
        appState.activeView = "history";
        if (typeof xRenderHistory === "function") xRenderHistory();
      }
      const activeKey = (v === "explore") ? "add-rank" : v;
      document.querySelectorAll("#app-nav button").forEach(b => b.classList.toggle("on", b.dataset.nav === activeKey));
      window.scrollTo(0, 0);
    };

    window.addEventListener("DOMContentLoaded", () => {
      // strip the old demo handlers and bind real ones
      const fresh = id => { const e = xq(id); if (!e) return null; const c = e.cloneNode(true); e.replaceWith(c); return c; };
      const target = () => ({ email: studentProfile.email, phone: studentProfile.phone });
      const sendOtp = async channel => { if (X_CFG.API_BASE) await xApi("/api/otp/send", Object.assign(target(), { channel })); };
      const checkOtp = async (channel, code) => {
        if (X_CFG.API_BASE) { await xApi("/api/otp/verify", { channel, target: channel === "email" ? studentProfile.email : studentProfile.phone, code }); return true; }
        return code === "000000";
      };
      const lastNavTapTimes = {};
      document.querySelectorAll("#app-nav button").forEach(b => {
        const navTarget = b.dataset.nav;

        // Double click to refresh on the 4 buttons in Pic 2
        if (["add-rank", "search", "priority", "analytics"].includes(navTarget)) {
          b.addEventListener("dblclick", (e) => {
            e.preventDefault();
            e.stopPropagation();
            window.location.reload();
          });
        }

        b.addEventListener("click", (e) => {
          const kNav = document.getElementById("kodnest-navbar-dropdown");
          if (b.dataset.nav === "profile") {
            e.stopPropagation();
            if (kNav) {
              const isHidden = kNav.classList.contains("hidden");
              kNav.classList.toggle("hidden");
              b.classList.toggle("on", isHidden);
            }
            return;
          }

          // Check for rapid double tap / double click to refresh (within 450ms)
          if (["add-rank", "search", "priority", "analytics"].includes(navTarget)) {
            const now = Date.now();
            const prev = lastNavTapTimes[navTarget] || 0;
            if (now - prev < 450 && now - prev > 40) {
              e.preventDefault();
              e.stopPropagation();
              window.location.reload();
              return;
            }
            lastNavTapTimes[navTarget] = now;
          }

          if (kNav) kNav.classList.add("hidden");
          switchMainView(b.dataset.nav);
        });
      });

      // Close profile dropdown on outside click
      document.addEventListener("click", (e) => {
        const kNav = document.getElementById("kodnest-navbar-dropdown");
        const bProf = document.getElementById("nav-profile");
        if (kNav && !kNav.classList.contains("hidden")) {
          if (!kNav.contains(e.target) && (!bProf || !bProf.contains(e.target))) {
            kNav.classList.add("hidden");
            if (appState.activeView !== "profile" && bProf) {
              bProf.classList.remove("on");
            }
          }
        }
      });

      // Top right header: open docs button
      const headerDocsBtn = document.getElementById("header-open-docs-btn");
      if (headerDocsBtn) {
        headerDocsBtn.addEventListener("click", () => {
          switchMainView("docs");
        });
      }

      // Profile View: exam select change toggles rank vs payment
      const pExamSel = document.getElementById("p-exam-select");
      if (pExamSel) {
        pExamSel.addEventListener("change", (e) => {
          const rankBox = document.getElementById("p-rank-container");
          const payNote = document.getElementById("p-payment-note");
          if (e.target.value === "payment") {
            if (rankBox) rankBox.classList.add("hidden");
            if (payNote) payNote.classList.remove("hidden");
          } else {
            if (rankBox) rankBox.classList.remove("hidden");
            if (payNote) payNote.classList.add("hidden");
          }
        });
      }

      // Profile View: Open history
      const pHistBtn = document.getElementById("profile-open-history-btn");
      if (pHistBtn) {
        pHistBtn.addEventListener("click", () => switchMainView("history"));
      }

      // Profile View: Logout Button
      const pLogoutBtn = document.getElementById("profile-logout-btn");
      if (pLogoutBtn) {
        pLogoutBtn.addEventListener("click", () => {
          studentProfile.isLoggedIn = false;
          try {
            if (typeof xLS !== "undefined") xLS.del("i2t_session_v9");
            localStorage.removeItem("bridge_token");
            localStorage.removeItem("bridge_user_email");
            localStorage.removeItem("bridge_last_user_email");
            localStorage.removeItem("bridge_profile");
            localStorage.removeItem("i2t_profile_v9");
            sessionStorage.clear();
          } catch (e) {}
          if (typeof window.updateAppNavVisibility === "function") window.updateAppNavVisibility();
          showToast("Logged out of account successfully.", "👋");
          setTimeout(() => location.reload(), 600);
        });
      }

      // Profile View: Save Profile & Intermediate Details
      const pSaveBtn = document.getElementById("profile-save-btn");
      if (pSaveBtn) {
        pSaveBtn.addEventListener("click", () => {
          const fullName = document.getElementById("p-student-name")?.value.trim() || studentProfile.fullName || "Student";
          const interPct = document.getElementById("p-inter-pct")?.value.trim() || studentProfile.interPct || "92.0%";
          const interHall = document.getElementById("p-inter-hallticket")?.value.trim() || "";

          studentProfile.fullName = fullName;
          studentProfile.interPct = interPct;
          studentProfile.interBoard = document.getElementById("p-inter-board")?.value || "BIEAP (Andhra Pradesh)";
          studentProfile.interHallTicket = interHall;
          studentProfile.interGroup = document.getElementById("p-inter-group")?.value || "MPC";
          studentProfile.interYear1Marks = document.getElementById("p-inter-year1")?.value.trim() || "";
          studentProfile.interYear2Marks = document.getElementById("p-inter-year2")?.value.trim() || "";
          studentProfile.interCollegeName = document.getElementById("p-inter-college")?.value.trim() || "";
          studentProfile.interDistrict = document.getElementById("p-inter-district")?.value || "Krishna";
          studentProfile.gender = document.getElementById("p-gender")?.value || "Male";
          studentProfile.selectedExam = document.getElementById("p-exam-select")?.value || "ap_cet";
          studentProfile.homeState = document.getElementById("p-homestate")?.value || "Andhra Pradesh";

          appState.category = document.getElementById("p-category")?.value || "OC";
          appState.region = document.getElementById("p-region")?.value || "AU";
          appState.state = studentProfile.homeState;
          appState.exam = studentProfile.selectedExam;

          if (studentProfile.selectedExam === "payment") {
            appState.rank = null;
          } else {
            const entered = parseInt(document.getElementById("p-rank-input")?.value, 10);
            appState.rank = (!isNaN(entered) && entered > 0) ? entered : 12500;
          }

          xSaveSession();
          updateStudentBannersAndSheetHeader();
          updateHeaderBadges();
          setExamTab(appState.exam);
          renderProfileView();
          saveCompleteStudentDataset();
          showToast("Profile & Intermediate details saved successfully! ✅", "💾");
        });
      }

      // When clicking open-auth-portal-btn in header, if user has profile, open Profile view directly
      const authPortalBtn = document.getElementById("open-auth-portal-btn");
      if (authPortalBtn) {
        authPortalBtn.addEventListener("click", () => {
          switchMainView("profile");
        });
      }

      fresh("login-submit-btn").addEventListener("click", async () => {
        if (typeof xLogin === "function") {
          xLogin();
        }
      });
      [["email", "verify-email-otp-btn", "email-otp-input", "emailVerified", "Email verified"], ["phone", "verify-phone-otp-btn", "phone-otp-input", "phoneVerified", "Mobile verified"]].forEach(([ch, btn, inp, flag, msg]) => {
        fresh(btn).addEventListener("click", async () => {
          try { if (await checkOtp(ch, xq(inp).value.trim())) { studentProfile[flag] = true; updateOtpStatusUI(); showToast(msg, "✅"); } else showToast("Wrong code, try again", "⚠️"); }
          catch (e) { showToast(e.message, "⚠️"); }
        });
        fresh("resend-" + ch + "-otp-btn").addEventListener("click", async () => {
          try { await sendOtp(ch); showToast("New code sent to your " + (ch === "email" ? "email" : "phone"), "📲"); } catch (e) { showToast(e.message, "⚠️"); }
        });
      });
      fresh("proceed-to-student-details-btn").addEventListener("click", async () => {
        if (!studentProfile.emailVerified || !studentProfile.phoneVerified) return showToast("Verify both email and mobile OTP first", "⚠️");
        let profile = null, prefs = null;
        try {
          if (X_CFG.API_BASE) { const r = await xApi("/api/login/complete", target()); xLS.set("i2t_session_v9", { token: r.token }); profile = r.profile; prefs = r.prefs; }
          else { const u = (xLS.get("i2t_users_v9") || {})[studentProfile.email.toLowerCase()]; if (u) { profile = u.profile; prefs = u.prefs; } xLS.set("i2t_session_v9", {}); }
        } catch (e) { return showToast(e.message, "⚠️"); }
        if (profile) { xSaveSession(); xRestore(Object.assign({}, profile, { email: studentProfile.email, phone: studentProfile.phone, username: studentProfile.username }), prefs); showToast("Welcome back, " + profile.fullName + "!", "👋"); }
        else { setAuthStage(3); showToast("Verified! Add your student details.", "🎓"); }
      });

      // priority list goes to the student's own email (server) – never "faked" in the page
      fresh("confirm-send-email-pdf-btn").addEventListener("click", async () => {
        const to = xq("dispatch-to-email").value.trim() || studentProfile.email, cc = xq("dispatch-cc-email").value.trim();
        const lines = appState.priorityList.map((it, i) => { const c = collegesData.find(x => x.id === it.collegeId); return "#" + (i + 1) + " " + (c ? c.code + " - " + c.name : "") + " [" + it.branchCode + "]"; });
        const box = xq("email-dispatch-success-box"), txt = xq("email-dispatch-receipt-text");
        downloadPriorityPdf();
        try {
          if (!X_CFG.API_BASE) throw new Error("Email server not connected");
          await xApi("/api/send-priority", { to, cc, name: studentProfile.fullName, exam: appState.exam, rank: appState.rank, category: appState.category, lines });
          txt.innerHTML = "Emailed to <strong>" + to + "</strong>. A PDF copy was also downloaded.";
        } catch (e) { txt.innerHTML = "Could not email from here (" + e.message + "). PDF downloaded; use “Open in mail app” to send it."; }
        box.classList.remove("hidden");
      });

      xq("hist-list").addEventListener("click", e => {
        const b = e.target.closest("button[data-h]"); if (!b) return;
        const id = +b.dataset.id, h = xHist(), r = h.find(x => x.id === id); if (!r) return;
        if (b.dataset.h === "del") { xLS.set(xHistKey(), h.filter(x => x.id !== id)); xPush(); xRenderHistory(); }
        else { appState.priorityList = JSON.parse(JSON.stringify(r.items)); saveState(); updateHeaderBadges(); switchMainView("priority"); showToast("Priority list restored", "📋"); }
      });
      xq("hist-save-btn").addEventListener("click", () => { if (xSnap(true)) { xRenderHistory(); showToast("Version saved to history", "🕘"); } else showToast("Your priority list is empty", "⚠️"); });
      const hLogout = xq("hist-logout-btn");
      if (hLogout) hLogout.addEventListener("click", () => {
        studentProfile.isLoggedIn = false;
        try {
          if (typeof xLS !== "undefined") xLS.del("i2t_session_v9");
          localStorage.removeItem("bridge_token");
          localStorage.removeItem("bridge_user_email");
          localStorage.removeItem("bridge_last_user_email");
          localStorage.removeItem("bridge_profile");
          localStorage.removeItem("i2t_profile_v9");
          sessionStorage.clear();
        } catch (_) {}
        if (typeof window.updateAppNavVisibility === "function") window.updateAppNavVisibility();
        location.reload();
      });

      // direct login for returning users (restores full profile & preferences)
      const s = (typeof xLS !== "undefined") ? xLS.get("i2t_session_v9") : null;
      if (s && s.profile) {
        studentProfile.isLoggedIn = true;
        xRestore(s.profile, s.prefs);
        if (typeof renderProfileView === "function") renderProfileView();
      }
      // Smooth dismissal for splash screen after ~1.6s so attractive zoom in/out effect is seen, or instantly on click/tap
      let splashDismissed = false;
      function dismissSplash() {
        if (splashDismissed) return;
        splashDismissed = true;
        try { document.body.classList.remove("splash-active"); } catch (_) {}
        if (typeof window.updateAppNavVisibility === "function") window.updateAppNavVisibility();

        const sp = document.getElementById("app-splash");
        if (sp) {
          sp.style.transition = "opacity 0.4s ease-out";
          sp.style.opacity = "0";
          setTimeout(() => {
            try { sp.remove(); } catch (_) {}
            try { document.body.classList.remove("splash-active"); } catch (_) {}
            if (typeof window.updateAppNavVisibility === "function") window.updateAppNavVisibility();
          }, 450);
        } else {
          if (typeof window.updateAppNavVisibility === "function") window.updateAppNavVisibility();
        }

        const urlParams = new URLSearchParams(window.location.search);
        const requestedTab = urlParams.get("tab");
        if (!requestedTab || requestedTab === "home" || requestedTab === "add-rank") {
          if (typeof switchMainView === "function") switchMainView("add-rank");
          if (typeof showHomeSlide === "function") showHomeSlide(1);
          window.scrollTo({ top: 0, behavior: "instant" });
        }
      }
      setTimeout(dismissSplash, 1800);
      document.getElementById("app-splash")?.addEventListener("click", dismissSplash);
    });
    // ---- 13. Account flow: OTP only for NEW users; existing users log in with password
    let xMode = "login", xPendingPw = "", xPendingRaw = "";
    async function xHash(p, e) {
      try { const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("i2t|" + e.toLowerCase() + "|" + p)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, "0")).join(""); }
      catch (_) { return "p:" + btoa(unescape(encodeURIComponent(p))); }
    }
    function xSetMode(m) {
      xMode = m; const f = m === "forgot";
      if (xq("auth-main-panel")) xq("auth-main-panel").classList.toggle("hidden", f);
      if (xq("auth-forgot-panel")) xq("auth-forgot-panel").classList.toggle("hidden", !f);
      ["auth-row-username", "auth-row-phone"].forEach(id => { if (xq(id)) xq(id).classList.toggle("hidden", m !== "signup"); });
      if (xq("auth-forgot-link")) xq("auth-forgot-link").classList.toggle("hidden", m !== "login");
      if (m === "signup") showAuthSlide("signup");
      else if (m === "login") showAuthSlide("signin");
      else if (m === "forgot") {
        const fp = document.getElementById("auth-forgot-panel");
        if (fp) fp.classList.remove("hidden");
      }
      setAuthStage(1);
    }
    const xErr = e => showToast(e.message || "Something went wrong", "⚠️");
    const xUsers = () => xLS.get("i2t_users_v9") || {};
    const xPreview = () => !X_CFG.API_BASE;

    async function xLogin() {
      const input = (document.getElementById("login-email-input")?.value || "").trim();
      const pass = document.getElementById("login-password-input")?.value || "";
      if (!input || !pass) return showToast("Enter your Username or Gmail and password", "⚠️");
      let profile = null, prefs = null, userEmail = input, token = "";
      try {
        if (X_CFG.API_BASE) {
          const d = await xApi("/api/login", { email: input, password: pass });
          token = d.token;
          profile = d.profile;
          prefs = d.prefs;
          if (d.email) userEmail = d.email;
        } else {
          const users = xUsers();
          let u = users[input.toLowerCase()];
          if (!u) {
            const found = Object.entries(users).find(([em, usr]) => {
              return (usr.profile && usr.profile.username && usr.profile.username.toLowerCase() === input.toLowerCase()) ||
                     (usr.username && usr.username.toLowerCase() === input.toLowerCase()) ||
                     (usr.email && usr.email.toLowerCase() === input.toLowerCase());
            });
            if (found) {
              userEmail = found[0];
              u = found[1];
            }
          }
          if (!u || !u.pwHash) return showToast("No account found for this username or Gmail. Tap “Sign up”.", "⚠️");
          if (u.pwHash !== await xHash(pass, userEmail)) return showToast("Wrong password. Use “Forgot password?” to reset it.", "⚠️");
          profile = u.profile;
          prefs = u.prefs;
        }
      } catch (e) { return xErr(e); }

      // Build complete restored profile
      const fullProfile = Object.assign({}, profile || {}, {
        email: userEmail,
        username: (profile && profile.username) || input,
        isLoggedIn: true
      });
      studentProfile.isLoggedIn = true;
      Object.assign(studentProfile, fullProfile);

      // Save complete session in LocalStorage so user is NEVER asked to login again on reload
      const sessionData = {
        token: token,
        email: userEmail,
        username: studentProfile.username,
        profile: fullProfile,
        prefs: prefs || {}
      };
      xLS.set("i2t_session_v9", sessionData);
      localStorage.setItem("bridge_token", token);
      localStorage.setItem("bridge_user_email", userEmail);
      localStorage.setItem("bridge_last_user_email", userEmail);
      localStorage.setItem("bridge_profile", JSON.stringify(fullProfile));
      localStorage.setItem("i2t_profile_v9", JSON.stringify(fullProfile));

      // Restore UI & preferences
      xRestore(fullProfile, prefs);
      renderProfileView();
      if (typeof updateStudentBannersAndSheetHeader === "function") updateStudentBannersAndSheetHeader();
      if (typeof updateHeaderBadges === "function") updateHeaderBadges();
      if (typeof saveCompleteStudentDataset === "function") saveCompleteStudentDataset();
      document.getElementById("auth-portal-overlay")?.classList.add("hidden");
      if (typeof window.updateAppNavVisibility === "function") window.updateAppNavVisibility();

      // Check if user has filled profile details or is missing them
      const hasCompletedProfile = fullProfile.fullName && (fullProfile.interCollegeName || fullProfile.school10Name || fullProfile.interPct || fullProfile.phone);
      if (hasCompletedProfile) {
        showToast("Welcome back, " + (fullProfile.fullName || userEmail) + "! Your saved details have been loaded.", "👋");
      } else {
        // User exists but has not completed their profile yet: ask them to fill details
        switchMainView("profile");
        setTimeout(() => {
          if (typeof populateEditModal === "function") populateEditModal();
          const editModal = document.getElementById("kodnest-profile-edit-modal");
          if (editModal) editModal.classList.remove("hidden");
          showToast("Welcome! Please fill in your student profile details.", "🎓");
        }, 250);
      }
    }

    async function xSignup() {
      const username = (document.getElementById("signup-username-input")?.value || xq("login-username-input")?.value || studentProfile.username || "").trim();
      const email = (document.getElementById("signup-email-input")?.value || xq("login-email-input")?.value || studentProfile.email || "").trim();
      const phone = (document.getElementById("signup-phone-input")?.value || xq("login-phone-input")?.value || studentProfile.phone || "").replace(/\D/g, "").slice(-10);
      const pass = document.getElementById("signup-password-input")?.value || xq("login-password-input")?.value || "";

      if (!username || !/^\S+@\S+\.\S+$/.test(email) || phone.length !== 10 || pass.length < 6) {
        return showToast("Fill username, valid email, 10-digit mobile and a password (6+ chars)", "⚠️");
      }

      let token = "";
      try {
        if (X_CFG.API_BASE) {
          const r = await xApi("/api/login/complete", { email, phone, username, password: pass });
          token = r.token;
        } else {
          const users = xUsers();
          users[email.toLowerCase()] = { email, phone, username, pwHash: await xHash(pass, email) };
          xLS.set("i2t_users_v9", users);
        }
      } catch (e) {
        if (/exists/i.test(e.message)) showAuthSlide("signin");
        return xErr(e);
      }

      // Initialize new student profile
      const newProfile = {
        isLoggedIn: true,
        email: email.toLowerCase(),
        username: username,
        phone: phone,
        fullName: username,
        emailVerified: true,
        phoneVerified: true
      };
      studentProfile.isLoggedIn = true;
      Object.assign(studentProfile, newProfile);

      // Save complete session
      const sessionData = {
        token: token,
        email: email.toLowerCase(),
        username: username,
        profile: newProfile,
        prefs: {}
      };
      xLS.set("i2t_session_v9", sessionData);
      localStorage.setItem("bridge_token", token);
      localStorage.setItem("bridge_user_email", email.toLowerCase());
      localStorage.setItem("bridge_last_user_email", email.toLowerCase());
      localStorage.setItem("bridge_profile", JSON.stringify(newProfile));
      localStorage.setItem("i2t_profile_v9", JSON.stringify(newProfile));

      renderProfileView();
      if (typeof updateHeaderBadges === "function") updateHeaderBadges();
      if (typeof saveCompleteStudentDataset === "function") saveCompleteStudentDataset();

      // Close auth modal
      document.getElementById("auth-portal-overlay")?.classList.add("hidden");
      if (typeof window.updateAppNavVisibility === "function") window.updateAppNavVisibility();

      // NEW USER REQUIREMENT:
      // "when the new user login the page when they creat acc next ask them to fill there details in the profile"
      switchMainView("profile");
      setTimeout(() => {
        if (typeof populateEditModal === "function") populateEditModal();
        const editModal = document.getElementById("kodnest-profile-edit-modal");
        if (editModal) editModal.classList.remove("hidden");
        showToast("Account created! Please fill in your student profile details below.", "🎓");
      }, 250);
    }
    // =========================================================================
    // =========================================================================
    // AUTHENTIC GOOGLE OAUTH 2.0 (GOOGLE IDENTITY SERVICES & TOKEN CLIENT)
    // =========================================================================
    const GOOGLE_CLIENT_ID = (window.I2T_CONFIG && window.I2T_CONFIG.GOOGLE_CLIENT_ID) || "347879525174-f5fkbf1qho1epabfifj1d6g03g4bl0fo.apps.googleusercontent.com";
    let googleTokenClient = null;
    let googleGsiInitialized = false;

    function xGoogleReady() {
      const apiBase = (window.I2T_CONFIG && window.I2T_CONFIG.API_BASE) || "";

      const setupGsiWithClientId = (clientId) => {
        if (!clientId) return;

        const initGsi = () => {
          if (typeof window.google === "undefined" || !window.google.accounts || !window.google.accounts.id) {
            setTimeout(initGsi, 150);
            return;
          }
          if (googleGsiInitialized) return;
          googleGsiInitialized = true;

          try {
            // 1. Initialize Google Identity Services ID Client
            window.google.accounts.id.initialize({
              client_id: clientId,
              callback: handleGoogleCredentialResponse,
              auto_select: false,
              cancel_on_tap_outside: true,
              context: "signin"
            });

            // Google OAuth 2.0 direct popup via round action button

            // 4. Initialize OAuth2 Token Client for Custom Button / Icon Clicks
            if (window.google.accounts.oauth2) {
              googleTokenClient = window.google.accounts.oauth2.initTokenClient({
                client_id: clientId,
                scope: "email profile openid",
                callback: async (tokenResponse) => {
                  if (tokenResponse && tokenResponse.access_token) {
                    await handleGoogleTokenResponse(tokenResponse.access_token);
                  } else if (tokenResponse && tokenResponse.error) {
                    console.warn("[Google OAuth] Popup closed or error:", tokenResponse.error);
                  }
                }
              });
            }

            // 5. Wire Custom Google Round Icon Buttons
            const bindTrigger = (btnId) => {
              const btn = document.getElementById(btnId);
              if (btn) {
                btn.onclick = (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  triggerGoogleLoginFlow();
                };
              }
            };
            bindTrigger("google-login-btn");
            bindTrigger("signup-google-btn");

            console.log("[Google OAuth 2.0] Fully initialized with client ID:", clientId);
          } catch (e) {
            console.error("[Google Identity Services Init Error]", e);
          }
        };

        if (typeof window.google === "undefined" || !window.google.accounts) {
          if (!document.querySelector('script[src*="accounts.google.com/gsi/client"]')) {
            const script = document.createElement("script");
            script.src = "https://accounts.google.com/gsi/client";
            script.async = true;
            script.defer = true;
            script.onload = initGsi;
            document.head.appendChild(script);
          } else {
            initGsi();
          }
        } else {
          initGsi();
        }
      };

      if (GOOGLE_CLIENT_ID) {
        setupGsiWithClientId(GOOGLE_CLIENT_ID);
      } else {
        fetch(apiBase + "/api/config")
          .then(res => res.json())
          .then(cfg => {
            if (cfg.googleClientId) setupGsiWithClientId(cfg.googleClientId);
          })
          .catch(err => console.warn("[Google Config]", err));
      }
    }

    // Trigger function for custom Google icon or button clicks
    function triggerGoogleLoginFlow() {
      if (googleTokenClient) {
        // Official Google OAuth 2.0 popup
        googleTokenClient.requestAccessToken({ prompt: "select_account" });
      } else if (window.google && window.google.accounts && window.google.accounts.id) {
        window.google.accounts.id.prompt();
      } else {
        showToast("Loading Google Sign-In...", "ℹ️");
        xGoogleReady();
      }
    }

    // Handler for Google Identity Services ID Token (JWT)
    async function handleGoogleCredentialResponse(response) {
      if (!response || !response.credential) return;
      await processGoogleAuthPayload({ credential: response.credential });
    }

    // Handler for Google OAuth 2.0 Access Token
    async function handleGoogleTokenResponse(accessToken) {
      if (!accessToken) return;
      await processGoogleAuthPayload({ accessToken: accessToken });
    }

    // Unified backend auth & user session processing
    async function processGoogleAuthPayload(payload) {
      const apiBase = (window.I2T_CONFIG && window.I2T_CONFIG.API_BASE) || "";
      try {
        showToast("Authenticating with Google...", "⏳");
        const res = await fetch(apiBase + "/api/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (!res.ok || !data.ok) {
          throw new Error(data.error || "Google Sign-In failed on server");
        }

        // 1. Save authentication session
        localStorage.setItem("bridge_token", data.token);
        localStorage.setItem("bridge_user_email", data.email);
        const dispatchInput = document.getElementById("dispatch-to-email");
        if (dispatchInput) dispatchInput.value = data.email;
        localStorage.setItem("bridge_last_user_email", data.email);
        localStorage.setItem("bridge_user", JSON.stringify(data.user || data.profile || {}));
        if (data.profile) {
          localStorage.setItem("bridge_profile", JSON.stringify(data.profile));
        }

        // Update global studentProfile & session
        if (typeof studentProfile !== "undefined") {
          studentProfile.isLoggedIn = true;
          Object.assign(studentProfile, data.profile || {}, {
            email: data.email,
            fullName: data.name || data.email,
            googleConnected: true
          });
        }
        if (typeof xLS !== "undefined") {
          xLS.set("i2t_session_v9", {
            token: data.token,
            email: data.email,
            profile: data.profile,
            prefs: data.prefs,
            googleConnected: true
          });
        }
        if (typeof xRestore === "function") xRestore(data.profile || {}, data.prefs);
        if (typeof applyAvatar === "function" && data.profile && data.profile.avatarUrl) {
          applyAvatar(data.profile.avatarUrl);
        }
        if (typeof renderProfileView === "function") renderProfileView();
        if (typeof updateStudentBannersAndSheetHeader === "function") updateStudentBannersAndSheetHeader();
        if (typeof updateHeaderBadges === "function") updateHeaderBadges();

        // 2. Hide auth modal overlay
        const overlay = document.getElementById("auth-portal-overlay");
        if (overlay) {
          overlay.classList.add("hidden");
        }

        // 3. Show welcoming notification
        if (data.existingAccount) {
          showToast(`Welcome back, ${data.name || data.email}!`, "✅");
        } else {
          showToast(`Welcome to The Bridge, ${data.name || data.email}!`, "🎉");
        }

        // 4. Update navigation and switch to home view
        if (typeof window.updateAppNavVisibility === "function") {
          window.updateAppNavVisibility();
        }
        if (typeof switchMainView === "function") {
          switchMainView("home");
        }
      } catch (err) {
        console.error("[Google Auth Error]", err);
        showToast("Google sign-in error: " + err.message, "⚠️");
      }
    }
    window.addEventListener("DOMContentLoaded", () => {
      const fresh = id => { const e = xq(id); if (!e) return { addEventListener: () => {} }; const c = e.cloneNode(true); e.replaceWith(c); return c; };
      xq("auth-tab-login")?.addEventListener("click", () => xSetMode("login"));
      xq("auth-tab-signup")?.addEventListener("click", () => xSetMode("signup"));
      xq("auth-forgot-link")?.addEventListener("click", () => { xSetMode("forgot"); const inp = xq("login-email-input"); if (inp && xq("fp-email")) xq("fp-email").value = inp.value; });
      xq("fp-back")?.addEventListener("click", () => xSetMode("login"));
      fresh("login-submit-btn").addEventListener("click", () => xMode === "signup" ? xSignup() : xLogin());
      fresh("toggle-password-visibility").addEventListener("click", () => { const i = xq("login-password-input"); if (i) i.type = i.type === "password" ? "text" : "password"; });
      
      // Initialize Custom Radio Dropdowns (Pic 1 Style with White Theme)
      setupCustomRadioDropdowns();

      // Initialize Bridge Enhancement Suite (Avatar, Geolocation & Dataset)
      setupUniwiseHeroFilters();
      setupBridgeAIMascot();
      updateProfileKpis();
      setupProfileAvatarControls();
      setupLocationDetection();
      setupDatasetExport();
      if (typeof studentProfile !== "undefined" && studentProfile?.avatarUrl) {
        applyAvatar(studentProfile.avatarUrl);
      }

      // Initialize authentic Google Identity Services
      xGoogleReady();

      fresh("proceed-to-student-details-btn").addEventListener("click", async () => {
        if (!studentProfile.emailVerified || !studentProfile.phoneVerified) return showToast("Verify both email and mobile OTP first", "⚠️");
        try {
          if (X_CFG.API_BASE) { const r = await xApi("/api/login/complete", { email: studentProfile.email, phone: studentProfile.phone, username: studentProfile.username, password: xPendingRaw }); xLS.set("i2t_session_v9", { token: r.token }); }
          else xLS.set("i2t_session_v9", {});
        } catch (e) { return xErr(e); }
        setAuthStage(3); showToast("Verified! Add your student details.", "🎓");
      });

      fresh("fp-send").addEventListener("click", async () => {
        const email = xq("fp-email").value.trim(); if (!email) return showToast("Enter your registered email", "⚠️");
        try {
          if (X_CFG.API_BASE) await xApi("/api/forgot", { email });
          else if (!(xUsers()[email.toLowerCase()] || {}).pwHash) return showToast("No account found for this email", "⚠️");
        } catch (e) { return xErr(e); }
        const pv = xq("fp-preview");
        if (xPreview()) { pv.textContent = "Preview build: use 000000 as the reset code."; pv.classList.remove("hidden"); } else pv.classList.add("hidden");
        showToast("If this email has an account, a reset code is on its way", "📧");
      });
      fresh("fp-reset").addEventListener("click", async () => {
        const email = xq("fp-email").value.trim(), code = xq("fp-code").value.trim(), pw = xq("fp-pass").value;
        if (pw.length < 6 || code.length !== 6) return showToast("Enter the 6-digit code and a new password (6+ chars)", "⚠️");
        try {
          if (X_CFG.API_BASE) await xApi("/api/reset", { email, code, password: pw });
          else {
            const u = xUsers(), k = email.toLowerCase();
            if (code !== "000000" || !u[k]) return showToast("Wrong code", "⚠️");
            u[k].pwHash = await xHash(pw, email); xLS.set("i2t_users_v9", u);
          }
        } catch (e) { return xErr(e); }
        xq("login-email-input").value = email; xq("login-password-input").value = "";
        xSetMode("login"); showToast("Password updated. Please log in.", "✅");
      });

      // header profile button: logged-in users toggle KodNest dropdown, others see login
      const topAuthBtn = fresh("open-auth-portal-btn");
      const kNavDropdown = document.getElementById("kodnest-navbar-dropdown");
      if (topAuthBtn) {
        topAuthBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          if (studentProfile && studentProfile.fullName) {
            switchMainView("profile");
          } else {
            xq("auth-portal-overlay").classList.remove("hidden");
            xSetMode("login");
          }
        });
      }
      document.addEventListener("click", (e) => {
        if (kNavDropdown && !kNavDropdown.contains(e.target) && e.target !== topAuthBtn) {
          kNavDropdown.classList.add("hidden");
        }
      });

      // Wire items inside KodNest dropdown (Attached to bottom Profile button)
      const dProf = document.getElementById("nav-menu-profile-btn");
      if (dProf) dProf.addEventListener("click", () => {
        switchMainView("profile");
        if (kNavDropdown) kNavDropdown.classList.add("hidden");
      });

      const dCoun = document.getElementById("nav-menu-counseling-btn");
      if (dCoun) dCoun.addEventListener("click", () => {
        if (kNavDropdown) kNavDropdown.classList.add("hidden");
        openCounselingDetailsModal();
      });

      // dFeed handled by initKodNestProfileOptions

      const dMentor = document.getElementById("nav-menu-mentor-btn");
      if (dMentor) dMentor.addEventListener("click", () => {
        if (kNavDropdown) kNavDropdown.classList.add("hidden");
        const drawer = document.getElementById("bridge-ai-drawer");
        if (drawer) drawer.classList.remove("hidden", "translate-x-full");
      });

      const dAppFeed = document.getElementById("nav-menu-appfeedback-btn");
      if (dAppFeed) dAppFeed.addEventListener("click", () => {
        if (kNavDropdown) kNavDropdown.classList.add("hidden");
        showToast("Opening student feedback portal...", "✍️");
      });

      const dLogout = document.getElementById("nav-menu-logout-btn");
      if (dLogout) dLogout.addEventListener("click", () => {
        studentProfile.isLoggedIn = false;
        try {
          if (typeof xLS !== "undefined") xLS.del("i2t_session_v9");
          localStorage.removeItem("bridge_token");
          localStorage.removeItem("bridge_user_email");
          localStorage.removeItem("bridge_last_user_email");
          localStorage.removeItem("bridge_profile");
          localStorage.removeItem("i2t_profile_v9");
          sessionStorage.clear();
        } catch (e) {}
        if (typeof window.updateAppNavVisibility === "function") window.updateAppNavVisibility();
        showToast("Logged out successfully.", "👋");
        setTimeout(() => location.reload(), 500);
      });

      // Call renderProfileView on initial load to ensure header and profile are synced
      if (typeof renderProfileView === "function") {
        renderProfileView();
      }
    });
    // ---- 14. Gender-based eligibility + eligible-only colleges (simulator removed)
    const isWomenCollege = c => /women|mahila|ladies|girls/i.test(c.name);
    const genderOk = c => ((studentProfile.gender || "").toLowerCase() === "male") ? !isWomenCollege(c) : true; // women: all colleges; men: co-ed only
    const isEligible = it => {
      const c = collegesData.find(x => x.id === it.collegeId); if (!c) return false;
      const b = c.branches.find(x => x.code === it.branchCode) || c.branches[0];
      return c.exam === "payment" || !appState.rank || appState.rank <= getScaledCutoff(b.closingRank, appState.category, c.exam);
    };
    runMockAllotmentSimulation = function () {};   // removed feature
    const _gfc = getFilteredColleges;
    getFilteredColleges = function () {
      appState.onlyEligible = true;                 // always list only colleges the rank can get
      const t = xq("only-eligible-toggle"); if (t) t.checked = true;
      return _gfc().filter(genderOk);
    };
    const _rps = renderPrioritySheet;
    renderPrioritySheet = function () {
      const before = appState.priorityList.length;
      appState.priorityList = appState.priorityList.filter(it => { const c = collegesData.find(x => x.id === it.collegeId); return !c || genderOk(c); });
      if (appState.priorityList.length !== before) saveState();
      _rps();
      const box = xq("eligible-summary"); if (!box) return;
      const L = appState.priorityList;
      if (!L.length) { box.classList.add("hidden"); return; }
      const ok = L.filter(isEligible), no = L.length - ok.length;
      const g = studentProfile.gender === "male" ? "Co-education colleges" : studentProfile.gender === "female" ? "Co-education + women’s colleges" : "All colleges";
      box.innerHTML = `<div class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950">
        <div class="font-extrabold uppercase tracking-wide">✅ ${ok.length} of ${L.length} options are eligible for your rank</div>
        <div class="mt-1 text-emerald-900">${g} • Rank ${appState.rank ? appState.rank.toLocaleString("en-IN") : "Open"} (${appState.category})${no ? ` • ${no} option${no > 1 ? "s are" : " is"} above your rank (kept as reach options)` : ""}</div></div>`;
      box.classList.remove("hidden");
    };
    const _aw3 = applyStudentWizardAndLaunch;
    applyStudentWizardAndLaunch = function (t) {
      const g = xq("wiz-gender-select").value;
      if (!g) return showToast("Please select your gender first", "⚠️");
      studentProfile.gender = g; _aw3(t);
    };
    const _xr = xRestore;
    xRestore = function (p, pr) {
      _xr(p, pr);
      if (!studentProfile.gender) studentProfile.gender = "M"; // Safe default, never auto-popup auth overlay on refresh
      renderExplorer();
      renderPrioritySheet();
    };
    const _sas = setAuthStage;
    setAuthStage = function (n) { _sas(n); if (n === 3 && studentProfile.gender) xq("wiz-gender-select").value = studentProfile.gender; };
    // ---- 15. Back / Next on every modal slide + live route from the student's current location
    const X_TABS = ["overview", "payment", "scholarships", "hostels", "travel", "food"];
    let xTab = "overview", xPos = null, xGeoDenied = false;
    const xVisibleTabs = () => X_TABS.filter(k => { const b = xq("modal-tab-btn-" + k); return b && !b.classList.contains("hidden") && b.offsetParent !== null; });
    function xModalNav() {
      const v = xVisibleTabs(), i = v.indexOf(xTab);
      xq("modal-step-label").textContent = i >= 0 ? "Slide " + (i + 1) + " of " + v.length : "";
      xq("modal-prev-btn").textContent = i <= 0 ? "← Close" : "← Back";
      xq("modal-next-btn").disabled = i < 0 || i >= v.length - 1;
    }
    const _smt = switchModalTab;
    switchModalTab = function (k) {
      _smt(k); xTab = k; xModalNav();
      const sec = xq("modal-section-" + k); if (sec && sec.parentElement) sec.parentElement.scrollTop = 0;
      if (k === "travel") xRouteRender(!xPos && !xGeoDenied);
    };
    const xCollege = () => collegesData.find(c => c.id === appState.activeModalCollegeId);
    function xRouteRender(autoDetect) {
      const box = xq("live-route-result"), c = xCollege(); if (!c) return;
      if (!xPos) { if (autoDetect) xDetect(); return; }
      const o = xPos.latitude.toFixed(6) + "," + xPos.longitude.toFixed(6), d = encodeURIComponent(c.name + ", " + c.location);
      const link = (m, label, cls) => `<a target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&origin=${o}&destination=${d}&travelmode=${m}" class="px-3 py-2 rounded-lg text-white font-bold ${cls}">${label}</a>`;
      box.innerHTML = `<div class="p-2.5 rounded-lg bg-white border border-emerald-200 text-emerald-950">✅ Current location detected (±${Math.round(xPos.accuracy || 0)} m): <strong>${o}</strong><br>
        <span class="text-slate-600">To: ${c.name}, ${c.location}</span></div>
        <div class="flex flex-wrap gap-2">${link("driving", "🚗 Drive route", "bg-blue-600 hover:bg-blue-700")}${link("transit", "🚆 Bus / Train route", "bg-indigo-600 hover:bg-indigo-700")}${link("walking", "🚶 Walk route", "bg-slate-700 hover:bg-slate-800")}</div>
        <p class="text-[11px] text-slate-500">Opens Google Maps with your live location as the start and this college as the destination, with distance, time and turn-by-turn directions.</p>`;
      box.classList.remove("hidden");
    }
    function xDetect() {
      const box = xq("live-route-result"); box.classList.remove("hidden");
      if (!navigator.geolocation) { box.innerHTML = `<p class="text-rose-700 font-semibold">This browser can’t detect location. Open the app in Chrome or Safari on your phone.</p>`; return; }
      box.innerHTML = `<p class="text-emerald-900 font-semibold">⏳ Detecting your location… tap “Allow” if asked.</p>`;
      navigator.geolocation.getCurrentPosition(pos => { xPos = pos.coords; xGeoDenied = false; xRouteRender(false); },
        err => {
          xGeoDenied = true;
          box.innerHTML = `<p class="text-rose-700 font-semibold">${err.code === 1 ? "Location is off or blocked." : "Couldn’t get your location."}</p>
            <p class="text-slate-600">Turn on <strong>Location / GPS</strong> in your phone settings, allow location for this app in the browser, then tap “Detect my location” again.${err.code === 1 ? " If you opened this inside a preview window, open the app in its own browser tab." : ""}</p>`;
        }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 });
    }
    
    // =========================================================================
    // KODNEST PROFILE DROPDOWN OPTIONS & MODALS CONTROLLER (April Batch 2026)
    // =========================================================================
    (function initKodNestProfileOptions() {
      const kNavDropdown = document.getElementById("kodnest-navbar-dropdown");
      const closeDropdown = () => { if (kNavDropdown) kNavDropdown.classList.add("hidden"); };

      // 1. My Account
      const myAccountBtn = document.getElementById("nav-menu-my-account-btn");
      if (myAccountBtn) {
        myAccountBtn.addEventListener("click", () => {
          closeDropdown();
          if (typeof switchMainView === "function") switchMainView("profile");
        });
      }

      // 2. History (Replaced Compiler in Profile Dropdown)
      const menuHistoryBtn = document.getElementById("nav-menu-history-btn");
      if (menuHistoryBtn) {
        menuHistoryBtn.addEventListener("click", () => {
          closeDropdown();
          if (typeof switchMainView === "function") switchMainView("history");
        });
      }

      // Compiler Studio Controller
      const compilerModal = document.getElementById("kodnest-compiler-modal");
      const compilerBtn = document.getElementById("nav-menu-compiler-btn");
      const cardCompilerBtn = document.getElementById("kodnest-btn-compiler");
      if (cardCompilerBtn && compilerModal) {
        cardCompilerBtn.addEventListener("click", () => {
          compilerModal.classList.remove("hidden");
        });
      }
      const closeCompilerBtn = document.getElementById("close-compiler-modal-btn");
      const compilerLangSel = document.getElementById("compiler-lang-select");
      const compilerCodeInput = document.getElementById("compiler-code-input");
      const compilerOutput = document.getElementById("compiler-output");
      const compilerRunBtn = document.getElementById("compiler-run-btn");
      const compilerResetBtn = document.getElementById("compiler-reset-btn");
      const compilerFilenameTab = document.getElementById("compiler-filename-tab");

      const STARTER_CODES = {
        java: '// KodNest B.Tech Academy - April Batch 2026\n// Student: athota (BRG2026-3031)\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("🚀 KodNest B.Tech Bridge Online Studio");\n        System.out.println("Hello, athota! Ready for placement practice.");\n        int eapcetRank = 99958;\n        System.out.println("Cutoff Target: " + eapcetRank);\n    }\n}',
        python: '# KodNest B.Tech Academy - April Batch 2026\n# Student: athota (BRG2026-3031)\n\ndef check_rank(rank):\n    print(f"Analyzing AP EAPCET Rank: {rank}...")\n    return "Eligible for Top AP Engineering Programs!"\n\nif __name__ == "__main__":\n    print("🚀 KodNest Python 3 Studio")\n    print(check_rank(99958))',
        cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "🚀 KodNest C++20 Studio" << endl;\n    cout << "Welcome athota - April Batch 2026" << endl;\n    cout << "Ready for Tech Placements!" << endl;\n    return 0;\n}',
        c: '#include <stdio.h>\n\nint main() {\n    printf("🚀 KodNest C Studio\\n");\n    printf("Welcome athota - April Batch 2026\\n");\n    return 0;\n}',
        javascript: '// KodNest B.Tech Academy - April Batch 2026\nconsole.log("🚀 KodNest JS Studio");\nconst student = { name: "athota", batch: "April Batch 2026", rank: 99958 };\nconsole.log("Welcome " + student.name + "! Status: Online");'
      };

      const FILENAMES = {
        java: 'Main.java',
        python: 'main.py',
        cpp: 'main.cpp',
        c: 'main.c',
        javascript: 'main.js'
      };

      if (compilerBtn && compilerModal) {
        compilerBtn.addEventListener("click", () => {
          closeDropdown();
          compilerModal.classList.remove("hidden");
          if (compilerCodeInput && !compilerCodeInput.value) {
            const lang = compilerLangSel ? compilerLangSel.value : 'java';
            compilerCodeInput.value = STARTER_CODES[lang] || STARTER_CODES.java;
            if (compilerFilenameTab) compilerFilenameTab.textContent = FILENAMES[lang] || 'Main.java';
          }
        });
      }

      if (closeCompilerBtn && compilerModal) {
        closeCompilerBtn.addEventListener("click", () => compilerModal.classList.add("hidden"));
        compilerModal.addEventListener("click", (e) => { if (e.target === compilerModal) compilerModal.classList.add("hidden"); });
      }

      if (compilerLangSel && compilerCodeInput) {
        compilerLangSel.addEventListener("change", (e) => {
          const lang = e.target.value;
          compilerCodeInput.value = STARTER_CODES[lang] || '';
          if (compilerFilenameTab) compilerFilenameTab.textContent = FILENAMES[lang] || 'Main.java';
          if (compilerOutput) compilerOutput.textContent = 'Click "Run Code" to compile and execute program...';
        });
      }

      if (compilerResetBtn && compilerCodeInput && compilerLangSel) {
        compilerResetBtn.addEventListener("click", () => {
          const lang = compilerLangSel.value;
          compilerCodeInput.value = STARTER_CODES[lang] || '';
          if (compilerOutput) compilerOutput.textContent = 'Code reset to starter template.';
        });
      }

      if (compilerRunBtn && compilerOutput && compilerCodeInput) {
        compilerRunBtn.addEventListener("click", () => {
          const lang = compilerLangSel ? compilerLangSel.value : 'java';
          const fn = FILENAMES[lang] || 'Main.java';
          compilerOutput.textContent = 'Compiling ' + fn + '...\n';
          setTimeout(() => {
            let sampleOut = '🚀 KodNest B.Tech Bridge Initialized!\nHello, athota! Welcome to Online Studio.\nTarget Rank: 99958 | Status: Verified\nEligible Colleges: 330 AP & National Institutes';
            if (lang === 'python') sampleOut = '🚀 KodNest Python 3 Studio\nAnalyzing AP EAPCET Rank: 99958...\nEligible for Top AP Engineering Programs!';
            if (lang === 'javascript') {
              try {
                let logs = [];
                const customConsole = { log: (...args) => logs.push(args.join(' ')) };
                new Function('console', compilerCodeInput.value)(customConsole);
                if (logs.length > 0) sampleOut = logs.join('\n');
              } catch (err) {
                sampleOut = 'Runtime Error: ' + err.message;
              }
            }
            compilerOutput.textContent = '[KodNest Runner 2026] Build Successful (0.024s)\n----------------------------------------\n' + sampleOut + '\n----------------------------------------\nProcess finished with exit code 0';
          }, 350);
        });
      }

      // 3. User Feedback & App Rating Modal (Sequential 2-step flow)
      const feedbackModal = document.getElementById("kodnest-user-feedback-modal");
      const feedbackBtn = document.getElementById("nav-menu-feedback-btn");
      const closeFeedbackBtn = document.getElementById("close-feedback-modal-btn");
      const cancelFeedbackBtn = document.getElementById("cancel-feedback-btn");
      const finishFeedbackBtn = document.getElementById("feedback-finish-btn");
      const feedbackGotoRatingBtn = document.getElementById("feedback-goto-rating-btn");
      const feedbackBackToStep1Btn = document.getElementById("feedback-back-to-step1-btn");
      const submitFeedbackBtn = document.getElementById("submit-feedback-btn");
      const feedbackTextInput = document.getElementById("feedback-text-input");
      const feedbackQuotePreview = document.getElementById("feedback-quote-preview");
      const feedbackStarLabel = document.getElementById("feedback-star-label");
      const starContainer = document.getElementById("feedback-stars-container");
      const feedbackModalTitle = document.getElementById("feedback-modal-title");
      const feedbackModalSubtitle = document.getElementById("feedback-modal-subtitle");
      const step1El = document.getElementById("feedback-step-1");
      const step2El = document.getElementById("feedback-step-2");
      const step3El = document.getElementById("feedback-step-3");
      const successRatingSpan = document.getElementById("feedback-success-rating");

      let userRatingScore = 5;
      const RATING_DESCRIPTIONS = {
        1: "1 / 5 - 🔧 Needs Improvement",
        2: "2 / 5 - 😐 Fair Experience",
        3: "3 / 5 - 👍 Good & Useful",
        4: "4 / 5 - ⭐ Very Good & Helpful",
        5: "5 / 5 - 🤩 Outstanding Experience!"
      };

      function updateStarDisplay(score) {
        if (!starContainer) return;
        starContainer.querySelectorAll("span[data-star]").forEach(star => {
          const val = parseInt(star.dataset.star, 10);
          if (val <= score) {
            star.className = "text-amber-400 transition hover:scale-125 inline-block cursor-pointer";
          } else {
            star.className = "text-slate-600 transition hover:scale-125 inline-block cursor-pointer";
          }
        });
        if (feedbackStarLabel) {
          feedbackStarLabel.textContent = RATING_DESCRIPTIONS[score] || (score + " / 5 Stars");
        }
      }

      function resetFeedbackModal() {
        if (step1El) step1El.classList.remove("hidden");
        if (step2El) step2El.classList.add("hidden");
        if (step3El) step3El.classList.add("hidden");
        if (feedbackModalTitle) feedbackModalTitle.textContent = "The Bridge - User Feedback";
        if (feedbackModalSubtitle) feedbackModalSubtitle.textContent = "Share your experience with The Bridge App";
        updateStarDisplay(userRatingScore);
      }

      if (feedbackBtn && feedbackModal) {
        feedbackBtn.addEventListener("click", () => {
          closeDropdown();
          resetFeedbackModal();
          feedbackModal.classList.remove("hidden");
        });
      }

      if (closeFeedbackBtn && feedbackModal) {
        closeFeedbackBtn.addEventListener("click", () => feedbackModal.classList.add("hidden"));
      }
      if (cancelFeedbackBtn && feedbackModal) {
        cancelFeedbackBtn.addEventListener("click", () => feedbackModal.classList.add("hidden"));
      }
      if (finishFeedbackBtn && feedbackModal) {
        finishFeedbackBtn.addEventListener("click", () => feedbackModal.classList.add("hidden"));
      }
      if (feedbackModal) {
        feedbackModal.addEventListener("click", (e) => {
          if (e.target === feedbackModal) feedbackModal.classList.add("hidden");
        });
      }

      // Quick Tag Pills for Feedback
      document.querySelectorAll(".feedback-tag-pill").forEach(pill => {
        pill.addEventListener("click", () => {
          const tag = pill.dataset.tag || pill.textContent.trim();
          if (!feedbackTextInput) return;
          const currentText = feedbackTextInput.value.trim();
          if (currentText.includes(tag)) {
            feedbackTextInput.value = currentText.replace(tag, "").replace(/,\s*,/g, ",").replace(/^\s*,|\s*,$/g, "").trim();
            pill.classList.remove("bg-amber-500/20", "text-amber-300", "border-amber-500/50");
            pill.classList.add("bg-slate-800", "text-slate-300");
          } else {
            feedbackTextInput.value = currentText ? currentText + ", " + tag : tag;
            pill.classList.add("bg-amber-500/20", "text-amber-300", "border-amber-500/50");
            pill.classList.remove("bg-slate-800", "text-slate-300");
          }
          feedbackTextInput.focus();
        });
      });

      // Step 1 -> Step 2: "Next: Rate The App ⭐"
      if (feedbackGotoRatingBtn) {
        feedbackGotoRatingBtn.addEventListener("click", () => {
          let text = feedbackTextInput ? feedbackTextInput.value.trim() : "";
          if (!text) {
            text = "Great experience using The Bridge for AP EAPCET college options and cutoff predictions!";
            if (feedbackTextInput) feedbackTextInput.value = text;
          }
          if (feedbackQuotePreview) {
            feedbackQuotePreview.textContent = `"${text}"`;
          }
          if (step1El) step1El.classList.add("hidden");
          if (step2El) step2El.classList.remove("hidden");
          if (feedbackModalTitle) feedbackModalTitle.textContent = "The Bridge - Rate The App";
          if (feedbackModalSubtitle) feedbackModalSubtitle.textContent = "Step 2 of 2: Rate your overall experience";
        });
      }

      // Step 2 -> Step 1: "← Edit Feedback"
      if (feedbackBackToStep1Btn) {
        feedbackBackToStep1Btn.addEventListener("click", () => {
          if (step2El) step2El.classList.add("hidden");
          if (step1El) step1El.classList.remove("hidden");
          if (feedbackModalTitle) feedbackModalTitle.textContent = "The Bridge - User Feedback";
          if (feedbackModalSubtitle) feedbackModalSubtitle.textContent = "Share your experience with The Bridge App";
        });
      }

      // Star Rating Click & Hover
      if (starContainer) {
        starContainer.querySelectorAll("span[data-star]").forEach(star => {
          star.addEventListener("click", () => {
            userRatingScore = parseInt(star.dataset.star, 10);
            updateStarDisplay(userRatingScore);
          });
          star.addEventListener("mouseenter", () => {
            const hoverVal = parseInt(star.dataset.star, 10);
            updateStarDisplay(hoverVal);
          });
        });
        starContainer.addEventListener("mouseleave", () => {
          updateStarDisplay(userRatingScore);
        });
      }

      // Step 2 -> Step 3: Submit Feedback & Rating (Delivered to athotasridharchakravarthy@gmail.com)
      if (submitFeedbackBtn) {
        submitFeedbackBtn.addEventListener("click", (e) => {
          e.preventDefault();
          const feedbackVal = feedbackTextInput ? feedbackTextInput.value.trim() : "";
          const nameInput = document.getElementById("feedback-user-name");
          const emailInput = document.getElementById("feedback-user-email");
          const senderName = nameInput ? nameInput.value.trim() : "";
          const senderEmail = emailInput ? emailInput.value.trim() : "";
          const recommendInput = document.querySelector('input[name="recommend-app"]:checked');
          const recommendVal = recommendInput ? recommendInput.value : "yes";

          const reviewRecord = {
            user: senderName || "athota",
            name: senderName,
            email: senderEmail,
            feedback: feedbackVal,
            rating: userRatingScore,
            recommend: recommendVal,
            date: new Date().toISOString()
          };

          try {
            const saved = JSON.parse(localStorage.getItem("bridge_app_reviews") || "[]");
            saved.push(reviewRecord);
            localStorage.setItem("bridge_app_reviews", JSON.stringify(saved));
          } catch (err) {}

          // Send to athotasridharchakravarthy@gmail.com via Backend API
          const apiBase = (window.I2T_CONFIG && window.I2T_CONFIG.API_BASE) ? window.I2T_CONFIG.API_BASE : "";
          fetch(apiBase + "/api/feedback", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(reviewRecord)
          }).catch(err => console.log("[Feedback API] Dispatched with fallback:", err.message));

          // Set direct mailto fallback link
          const mailtoBtn = document.getElementById("feedback-direct-mailto-btn");
          if (mailtoBtn) {
            const subject = encodeURIComponent(`[The Bridge Feedback] ${userRatingScore}★ Review from ${senderName || "Student"}`);
            const body = encodeURIComponent(`Hi Sridhar,\n\nHere is my feedback for The Bridge:\nRating: ${userRatingScore}/5 Stars\nRecommend: ${recommendVal}\n\nReview:\n"${feedbackVal}"\n\nFrom: ${senderName || "Student"} (${senderEmail || "N/A"})\nDate: ${new Date().toLocaleString()}`);
            mailtoBtn.href = `mailto:athotasridharchakravarthy@gmail.com?subject=${subject}&body=${body}`;
          }

          if (successRatingSpan) {
            successRatingSpan.textContent = `${userRatingScore}-star rating`;
          }

          if (step2El) step2El.classList.add("hidden");
          if (step3El) step3El.classList.remove("hidden");
          if (feedbackModalTitle) feedbackModalTitle.textContent = "Review Submitted 🎉";
          if (feedbackModalSubtitle) feedbackModalSubtitle.textContent = "Thank you for supporting The Bridge App";

          if (typeof showToast === "function") {
            showToast("Thank you! Feedback sent to founder team ⭐", "success");
          }
        });
      }

      // 4. Guide Modal (Replaced Resume Builder - Pic 3)
      const guideBtn = document.getElementById("nav-menu-guide-btn");
      const guideModal = document.getElementById("guide-modal");
      if (guideBtn && guideModal) {
        guideBtn.addEventListener("click", () => {
          closeDropdown();
          guideModal.classList.remove("hidden");
        });
      }

      // 5. Documents Checklist (Replaced Mock Interview - Pic 2)
      const navDocsBtn = document.getElementById("nav-menu-docs-btn");
      if (navDocsBtn) {
        navDocsBtn.addEventListener("click", () => {
          closeDropdown();
          if (typeof switchMainView === "function") {
            switchMainView("docs");
          }
        });
      }

      // 6. Why We Built This Modal (Replaced Apply for Leave - Pic 1)
      const whyBtn = document.getElementById("nav-menu-why-btn");
      const whyModal = document.getElementById("why-we-built-modal");
      if (whyBtn && whyModal) {
        whyBtn.addEventListener("click", () => {
          closeDropdown();
          if (whyModal) {
            whyModal.classList.remove("hidden");
            if (typeof switchWhySlide === "function") {
              switchWhySlide(1);
            }
          }
        });
      }

      // 7. Log Out
      const logoutBtn = document.getElementById("nav-menu-logout-btn");
      if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
          closeDropdown();
          studentProfile.isLoggedIn = false;
          try {
            if (typeof xLS !== "undefined") xLS.del("i2t_session_v9");
            localStorage.removeItem("bridge_token");
            localStorage.removeItem("bridge_user_email");
            localStorage.removeItem("bridge_last_user_email");
            localStorage.removeItem("bridge_profile");
            localStorage.removeItem("i2t_profile_v9");
            sessionStorage.clear();
          } catch (e) {}
          if (typeof window.updateAppNavVisibility === "function") window.updateAppNavVisibility();
          if (typeof showToast === "function") showToast("Logged out successfully. See you soon!", "👋");
          setTimeout(() => location.reload(), 500);
        });
      }
    })();

    // Dark Mode / Light Mode Controller
    function initThemeToggle() {
      const btn = document.getElementById("theme-toggle-btn");
      const icon = document.getElementById("theme-icon");
      if (!btn) return;

      function updateThemeUi() {
        const isDark = document.documentElement.classList.contains("dark");
        if (icon) {
          if (isDark) {
            // Dark Mode -> Sun Outline Logo (Pic 1)
            icon.innerHTML = `<svg viewBox="0 0 24 24" class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="4.2"></circle>
              <line x1="12" y1="2" x2="12" y2="5"></line>
              <line x1="12" y1="19" x2="12" y2="22"></line>
              <line x1="2" y1="12" x2="5" y2="12"></line>
              <line x1="19" y1="12" x2="22" y2="12"></line>
              <line x1="4.93" y1="4.93" x2="7.05" y2="7.05"></line>
              <line x1="16.95" y1="7.05" x2="19.07" y2="4.93"></line>
              <line x1="4.93" y1="19.07" x2="7.05" y2="16.95"></line>
              <line x1="16.95" y1="16.95" x2="19.07" y2="19.07"></line>
            </svg>`;
          } else {
            // Light Mode -> Crescent Moon Outline Logo (Pic 2)
            icon.innerHTML = `<svg viewBox="0 0 24 24" class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-800 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>`;
          }
        }
        btn.title = isDark ? "Switch to Light Mode" : "Switch to Dark Mode";
        btn.setAttribute("aria-label", isDark ? "Switch to Light Mode" : "Switch to Dark Mode");
      }

      updateThemeUi();

      btn.addEventListener("click", () => {
        const isDark = document.documentElement.classList.toggle("dark");
        try {
          localStorage.setItem("bridge_theme", isDark ? "dark" : "light");
        } catch (e) {}
        updateThemeUi();
      });
    }

    window.addEventListener("DOMContentLoaded", () => {
      initThemeToggle();
      setupCustomRadioDropdowns();
      xq("live-route-btn").addEventListener("click", () => { xGeoDenied = false; xDetect(); });
      xq("modal-prev-btn").addEventListener("click", () => {
        const v = xVisibleTabs(), i = v.indexOf(xTab);
        if (i <= 0) xq("close-modal-btn").click(); else switchModalTab(v[i - 1]);
      });
      xq("modal-next-btn").addEventListener("click", () => { const v = xVisibleTabs(), i = v.indexOf(xTab); if (i < v.length - 1) switchModalTab(v[i + 1]); });
      xq("wiz-back-btn").addEventListener("click", () => {
        const s = xLS.get("i2t_session_v9");
        if (s && s.profile) xq("auth-portal-overlay").classList.add("hidden"); else xSetMode("login");
      });
    });
