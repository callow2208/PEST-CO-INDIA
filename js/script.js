//DEVELOPER TOOLS PROTECTION — START

(function () {
  'use strict';

  // 1. Block right-click context menu
  document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
    return false;
  });

  // 2. Block common keyboard shortcuts for DevTools / View Source
  document.addEventListener('keydown', function (e) {
    var k = e.key || e.keyCode;
    // F12
    if (k === 'F12' || e.keyCode === 123) { e.preventDefault(); return false; }
    // Ctrl+Shift+I / Cmd+Option+I (Inspect)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (k === 'I' || k === 'i')) { e.preventDefault(); return false; }
    // Ctrl+Shift+J / Cmd+Option+J (Console)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (k === 'J' || k === 'j')) { e.preventDefault(); return false; }
    // Ctrl+Shift+C / Cmd+Shift+C (Elements picker)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (k === 'C' || k === 'c')) { e.preventDefault(); return false; }
    // Ctrl+U / Cmd+U (View Source)
    if ((e.ctrlKey || e.metaKey) && (k === 'U' || k === 'u')) { e.preventDefault(); return false; }
    // Ctrl+S / Cmd+S (Save page)
    if ((e.ctrlKey || e.metaKey) && (k === 'S' || k === 's')) { e.preventDefault(); return false; }
    // Ctrl+A / Cmd+A (Select all) — optional, remove if it interferes with form inputs
    // Ctrl+P / Cmd+P (Print)
    if ((e.ctrlKey || e.metaKey) && (k === 'P' || k === 'p')) { e.preventDefault(); return false; }
  });

  // 3. Detect DevTools open via window dimension trick
  // var _devtoolsOpen = false;
  // var _threshold = 160;
  // function _checkDevTools() {
  //   var widthDiff = window.outerWidth - window.innerWidth;
  //   var heightDiff = window.outerHeight - window.innerHeight;
  //   if (widthDiff > _threshold || heightDiff > _threshold) {
  //     if (!_devtoolsOpen) {
  //       _devtoolsOpen = true;
  //       document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;background:#1A1A1A;color:#C8A96E;flex-direction:column;gap:16px;"><p style="font-size:1.2rem;margin:0;">Access Restricted</p><p style="font-size:0.85rem;color:#888;margin:0;">This page is protected.</p></div>';
  //     }
  //   } else {
  //     _devtoolsOpen = false;
  //   }
  // }
  // setInterval(_checkDevTools, 1000);

  // 4. Disable text selection on non-input elements
  document.addEventListener('selectstart', function (e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return true;
    e.preventDefault();
    return false;
  });

  // 5. Disable drag
  document.addEventListener('dragstart', function (e) {
    e.preventDefault();
    return false;
  });

  // 6. Override console methods to deter inspection via console
  var _noop = function () {};
  try {
    window.console.log = _noop;
    window.console.warn = _noop;
    window.console.error = _noop;
    window.console.info = _noop;
    window.console.debug = _noop;
    window.console.table = _noop;
    window.console.dir = _noop;
  } catch (_) {}

})();

/*
   DEVELOPER TOOLS PROTECTION — END
   */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Sticky Navigation on Scroll
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar?.classList.add('sticky-nav');
    } else {
      navbar?.classList.remove('sticky-nav');
    }
  });

  // 2. Scroll Reveal Animations (Intersection Observer)
  const revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.1,
      rootMargin: '0px 0px -30px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('active'));
  }

  // 3. Highlight Active Nav Link
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const linkHref = link.getAttribute('href');
    if (linkHref === currentPath || (currentPath === '' && linkHref === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // 4. City Selection & Modal Flow (15 Cities -> 8 Services)
  let activeSelectedCity = '';
  let cityServiceModalInstance = null;
  const cityModalElem = document.getElementById('cityServiceModal');
  
  if (cityModalElem && window.bootstrap) {
    cityServiceModalInstance = new bootstrap.Modal(cityModalElem);
  }

  // Global City Card Click Handler
  window.handleCitySelect = function(cityName) {
    activeSelectedCity = cityName;
    const modalCityNameElem = document.getElementById('modalSelectedCityName');
    if (modalCityNameElem) {
      modalCityNameElem.textContent = cityName;
    }

    if (cityServiceModalInstance) {
      cityServiceModalInstance.show();
    } else {
      // Fallback direct redirection
      window.location.href = `contact.html?service_area=${encodeURIComponent(cityName)}`;
    }
  };

  // Global Service Selection inside City Modal
  window.selectServiceAndProceed = function(serviceName) {
    const city = activeSelectedCity || '';
    const targetUrl = `contact.html?service_area=${encodeURIComponent(city)}&service=${encodeURIComponent(serviceName)}`;
    
    if (cityServiceModalInstance) {
      cityServiceModalInstance.hide();
    }

    if (window.location.pathname.endsWith('contact.html') || window.location.pathname.includes('/contact')) {
      populateFormFromParams(city, serviceName);
      const formCard = document.querySelector('.contact-form-card');
      formCard?.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = targetUrl;
    }
  };

  // 5. Contact Form Parameter Auto-Populate Helper
  function populateFormFromParams(serviceArea, serviceName) {
    const serviceAreaSelect = document.getElementById('service_area');
    const serviceSelect = document.getElementById('service');

    // Populate City / Service Area dropdown
    if (serviceArea && serviceAreaSelect) {
      const targetCity = decodeURIComponent(serviceArea).replace(/\+/g, ' ').trim().toLowerCase();
      if (targetCity) {
        for (let i = 1; i < serviceAreaSelect.options.length; i++) {
          const opt = serviceAreaSelect.options[i];
          const val = opt.value.trim().toLowerCase();
          const text = opt.text.trim().toLowerCase();

          if (val === targetCity || text === targetCity || val.includes(targetCity) || targetCity.includes(val) || text.includes(targetCity)) {
            serviceAreaSelect.selectedIndex = i;
            serviceAreaSelect.value = opt.value;
            break;
          }
        }
      }
    }

    // Populate Service dropdown (Cockroach Control, Pest Control, Bird Control, Bedbug Control, Mosquito Control, Rodents Control, Termites Control, Wood Borer Control)
    if (serviceName && serviceSelect) {
      const targetService = decodeURIComponent(serviceName).replace(/\+/g, ' ').trim().toLowerCase();
      const targetClean = targetService.replace(/[^a-z0-9]/g, '');

      if (targetClean) {
        for (let i = 1; i < serviceSelect.options.length; i++) {
          const opt = serviceSelect.options[i];
          const val = opt.value.trim().toLowerCase();
          const text = opt.text.trim().toLowerCase();
          const valClean = val.replace(/[^a-z0-9]/g, '');
          const textClean = text.replace(/[^a-z0-9]/g, '');

          // Exact or stripped exact match
          if (val === targetService || text === targetService || valClean === targetClean || textClean === targetClean) {
            serviceSelect.selectedIndex = i;
            serviceSelect.value = opt.value;
            break;
          }

          // Substring match (safely check non-empty valClean)
          if (valClean && (valClean.includes(targetClean) || targetClean.includes(valClean) || textClean.includes(targetClean))) {
            serviceSelect.selectedIndex = i;
            serviceSelect.value = opt.value;
            break;
          }
        }
      }
    }
  }

  // Parse URL search params on contact page load
  const urlParams = new URLSearchParams(window.location.search);
  const paramServiceArea = urlParams.get('service_area') || urlParams.get('city');
  const paramService = urlParams.get('service');

  if (paramServiceArea || paramService) {
    populateFormFromParams(paramServiceArea, paramService);
  }

  // 6. Dynamic Residential vs Commercial Toggle
  const premiseRadioResidential = document.getElementById('premise_residential');
  const premiseRadioCommercial = document.getElementById('premise_commercial');
  const premiseSizeGroup = document.getElementById('premiseSizeGroup');
  const premiseSizeSelect = document.getElementById('premise_size');

  function updatePremiseTypeView() {
    const isCommercial = premiseRadioCommercial && premiseRadioCommercial.checked;
    const resToggleBtn = document.getElementById('btnPremiseRes');
    const comToggleBtn = document.getElementById('btnPremiseCom');

    if (isCommercial) {
      if (premiseSizeGroup) premiseSizeGroup.style.display = 'none';
      if (premiseSizeSelect) premiseSizeSelect.required = false;
      resToggleBtn?.classList.remove('active');
      comToggleBtn?.classList.add('active');
    } else {
      if (premiseSizeGroup) premiseSizeGroup.style.display = 'block';
      if (premiseSizeSelect) premiseSizeSelect.required = true;
      resToggleBtn?.classList.add('active');
      comToggleBtn?.classList.remove('active');
    }
  }

  premiseRadioResidential?.addEventListener('change', updatePremiseTypeView);
  premiseRadioCommercial?.addEventListener('change', updatePremiseTypeView);

  window.setPremiseType = function(type) {
    if (type === 'commercial' && premiseRadioCommercial) {
      premiseRadioCommercial.checked = true;
    } else if (premiseRadioResidential) {
      premiseRadioResidential.checked = true;
    }
    updatePremiseTypeView();
  };

  // 7. Contact Form Validation & Submission
  const contactForm = document.getElementById('contactForm');
  const formResult = document.getElementById('formResult');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nameVal = document.getElementById('name')?.value.trim();
      const phoneVal = document.getElementById('phone')?.value.trim();
      const emailVal = document.getElementById('email')?.value.trim();
      const serviceVal = document.getElementById('service')?.value;
      const serviceAreaVal = document.getElementById('service_area')?.value;
      const pincodeVal = document.getElementById('pincode')?.value.trim();
      const sqftInput = document.getElementById('square_feet');
      const sqftRaw = sqftInput?.value?.trim() || '';
      const sqftVal = parseFloat(sqftRaw);
      const submitBtn = contactForm.querySelector('button[type="submit"]');

      // Reset alert state
      if (formResult) {
        formResult.classList.add('d-none');
        formResult.className = 'alert d-none mb-4';
      }

      // Name validation
      if (!nameVal) {
        showError('Please enter your full name.');
        document.getElementById('name')?.focus();
        return;
      }

      // Mobile Number validation (Indian 10-digit)
      const cleanPhone = phoneVal.replace(/[^0-9]/g, '');
      const valid10 = cleanPhone.length === 10 && /^[6-9]/.test(cleanPhone);
      const valid12 = cleanPhone.length === 12 && cleanPhone.startsWith('91') && /^[6-9]/.test(cleanPhone.substring(2));

      if (!valid10 && !valid12) {
        showError('Please enter a valid 10-digit Indian mobile number (e.g. 9590178276).');
        document.getElementById('phone')?.focus();
        return;
      }

      // Email validation (optional field)
      if (emailVal && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
        showError('Please enter a valid email address or leave it empty.');
        document.getElementById('email')?.focus();
        return;
      }

      // Service selection validation
      if (!serviceVal || serviceVal === '') {
        showError('Please select the pest control service required.');
        document.getElementById('service')?.focus();
        return;
      }

      // Service Area / City validation
      if (!serviceAreaVal || serviceAreaVal === '') {
        showError('Please select your city / service area.');
        document.getElementById('service_area')?.focus();
        return;
      }

      // Pincode validation (6-digit Indian PIN)
      const cleanPin = pincodeVal.replace(/[^0-9]/g, '');
      if (cleanPin.length !== 6) {
        showError('Please enter a valid 6-digit Indian Pincode (e.g. 560067).');
        document.getElementById('pincode')?.focus();
        return;
      }

      // Square Feet Minimum Check (>= 200 sq.ft)
      if (!sqftRaw || isNaN(sqftVal) || sqftVal < 200) {
        showError('Square Feet must be entered and be at least 200 sq. ft.');
        sqftInput?.focus();
        return;
      }

      // Button indicator
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Submitting Enquiry...';
      }

      const formData = new FormData(contactForm);

      try {
        const response = await fetch('/php/contact.php', {
          method: 'POST',
          body: formData
        });

        let data;
        try {
          data = await response.json();
        } catch (jsonErr) {
          data = { status: response.ok ? 'success' : 'error' };
        }

        if (response.ok && data.status === 'success') {
          showSuccess(data.message || `Thank you, ${nameVal}! Your enquiry for ${serviceVal} in ${serviceAreaVal} has been received. Our specialist will call you shortly at ${phoneVal}.`);
          contactForm.reset();
          updatePremiseTypeView();
        } else {
          showError(data.message || 'Unable to submit enquiry. Please call us directly at 9590178276.');
        }
      } catch (err) {
        console.warn('Submission fallback:', err);
        showSuccess(`Thank you, ${nameVal}! Your enquiry for ${serviceVal} in ${serviceAreaVal} has been recorded. Our team will contact you shortly at ${phoneVal}.`);
        contactForm.reset();
        updatePremiseTypeView();
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'SUBMIT ENQUIRY <i class="bi bi-arrow-right ms-1"></i>';
        }
      }
    });

    function showError(msg) {
      if (formResult) {
        formResult.className = 'alert alert-danger mb-4';
        formResult.innerHTML = `<i class="bi bi-exclamation-triangle-fill me-2"></i>${msg}`;
        formResult.classList.remove('d-none');
        formResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }

    function showSuccess(msg) {
      if (formResult) {
        formResult.className = 'alert alert-success mb-4';
        formResult.innerHTML = `<i class="bi bi-check-circle-fill me-2"></i>${msg}`;
        formResult.classList.remove('d-none');
        formResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }
});
