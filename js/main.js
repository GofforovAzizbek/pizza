const sidebar = document.querySelector('.sidebar')
const menu = document.querySelector('.header__mobile-menu')

const sidebarClose = document.querySelector('.close__icons')

const menuLinks = document.querySelectorAll('.sidebar__menu-link')

menu.addEventListener('click', function () {
	sidebar.classList.remove('sidebar__close')
	sidebar.classList.add('open__sidebar')
})

sidebarClose.addEventListener('click', function () {
	sidebar.classList.remove('open__sidebar')
	sidebar.classList.add('sidebar__close')
})

menuLinks.forEach(link => {
	link.addEventListener('click', function () {
		sidebar.classList.remove('open__sidebar')
		sidebar.classList.add('sidebar__close')
	})
})
const player = document.querySelector('.video-player')
const video = player.querySelector('.video-player__video')
const playButton = player.querySelector('.video-player__play-button')

playButton.addEventListener('click', () => {
	if (video.paused) {
		video.play()
		playButton.style.display = 'none' 
	} else {
		video.pause()
		playButton.style.display = 'block' 
	}
})

video.addEventListener('ended', () => {
	playButton.style.display = 'block' 
})

document.addEventListener('DOMContentLoaded', () => {
	const DEFAULT_PRICES = { 22: 8.35, 28: 10.0, 33: 15.0 }
	const SIZES = [22, 28, 33]

	function makeUniqueId(base, idx) {
		return `${base}-${Date.now().toString(36)}-${idx}`
	}

	document.querySelectorAll('.menu__box').forEach((box, boxIndex) => {
		const fieldset = box.querySelector('.pizza-sizes')
		const radios = Array.from(box.querySelectorAll('input[type="radio"]'))
		const priceEl = box.querySelector('.menu__price-value')
		const qtyInput = box.querySelector('.quantity-input')
		const minusBtn = box.querySelector('.minus')
		const plusBtn = box.querySelector('.plus')
		const ingredientsBtn = box.querySelector('.menu__box-ingredients')
		const orderBtn = box.querySelector('.menu__box-btn')
		const img = box.querySelector('.menu__img')

		const attr = box.dataset
		const explicitPrices = {
			22: parseFloat(attr.price22 || box.getAttribute('data-price-22')) || null,
			28: parseFloat(attr.price28 || box.getAttribute('data-price-28')) || null,
			33: parseFloat(attr.price33 || box.getAttribute('data-price-33')) || null,
		}

		const displayedPriceText = priceEl
			? priceEl.textContent.trim().replace(',', '.')
			: ''
		const displayedPrice = parseFloat(displayedPriceText) || null

		let checkedRadio = box.querySelector('input[type="radio"]:checked')
		if (!checkedRadio && radios.length) {
			checkedRadio = radios.find(r => r.value === '28') || radios[0]
			if (checkedRadio) checkedRadio.checked = true
		}
		const checkedSize = checkedRadio ? parseInt(checkedRadio.value, 10) : 28

		const prices = {}
		if (explicitPrices[22] || explicitPrices[28] || explicitPrices[33]) {
			SIZES.forEach(s => {
				prices[s] =
					explicitPrices[s] !== null ? explicitPrices[s] : DEFAULT_PRICES[s]
			})
		} else if (displayedPrice) {
			SIZES.forEach(s => {
				if (s === checkedSize) prices[s] = displayedPrice
				else
					prices[s] = +(displayedPrice * Math.pow(s / checkedSize, 2)).toFixed(
						2
					)
			})
		} else {
			SIZES.forEach(s => (prices[s] = DEFAULT_PRICES[s]))
		}

		radios.forEach((r, i) => {
			const oldId = r.id || `size-${r.value}`
			let correspondingLabel = fieldset
				? fieldset.querySelector(`label[for="${oldId}"]`)
				: null

			if (!correspondingLabel) {
				const next = r.nextElementSibling
				if (next && next.tagName.toLowerCase() === 'label')
					correspondingLabel = next
			}

			const uniqueId = makeUniqueId(`pizza-size-${boxIndex}-${r.value}`, i)
			const wasChecked = r.checked
			r.id = uniqueId
			r.name = `pizza-size-${boxIndex}`

			if (correspondingLabel) {
				correspondingLabel.setAttribute('for', uniqueId)
			}
			if (wasChecked) r.checked = true
		})

		function getSelectedSize() {
			const sel = box.querySelector('input[type="radio"]:checked')
			return sel ? parseInt(sel.value, 10) : checkedSize
		}
		function updatePrice() {
			const size = getSelectedSize()
			const qty = Math.max(1, parseInt(qtyInput.value, 10) || 1)
			const base =
				prices[size] !== undefined ? prices[size] : DEFAULT_PRICES[size]
			const total = (base * qty).toFixed(2)
			if (priceEl) priceEl.textContent = total
		}

		if (minusBtn)
			minusBtn.addEventListener('click', () => {
				const v = Math.max(1, parseInt(qtyInput.value, 10) || 1)
				if (v > 1) {
					qtyInput.value = v - 1
					updatePrice()
				}
			})
		if (plusBtn)
			plusBtn.addEventListener('click', () => {
				const v = Math.max(1, parseInt(qtyInput.value, 10) || 1)
				qtyInput.value = v + 1
				updatePrice()
			})
		radios.forEach(r => r.addEventListener('change', updatePrice))
		updatePrice()

		if (ingredientsBtn) {
			ingredientsBtn.addEventListener('click', e => {
				e.preventDefault()
				const modal = document.getElementById('ingredientsModal')
				const overlay = document.getElementById('modalOverlay')
				const list = modal
					? modal.querySelector('.ingredients-modal__list')
					: null
				if (!modal || !overlay || !list) return

				list.textContent = ingredientsBtn.dataset.ingredients || ''
				modal.classList.add('active')
				overlay.classList.add('active')
				document.body.style.overflow = 'hidden'
			})
		}
		if (orderBtn && img) {
			orderBtn.addEventListener('click', e => {
				const cart = document.getElementById('cart-button')
				if (!cart) return

				const imgRect = img.getBoundingClientRect()
				const cartRect = cart.getBoundingClientRect()
				const fly = img.cloneNode(true)

				fly.style.position = 'fixed'
				fly.style.top = imgRect.top + 'px'
				fly.style.left = imgRect.left + 'px'
				fly.style.width = imgRect.width + 'px'
				fly.style.height = imgRect.height + 'px'
				fly.style.transition = 'all 2.2s cubic-bezier(0.22,0.61,0.36,1)'
				fly.style.zIndex = 9999
				fly.style.pointerEvents = 'none'
				document.body.appendChild(fly)

				requestAnimationFrame(() => {
					fly.style.top = cartRect.top + cartRect.height / 2 + 'px'
					fly.style.left = cartRect.left + cartRect.width / 2 + 'px'
					fly.style.width = '150px'
					fly.style.opacity = '0'
				})

				setTimeout(() => {
					if (fly.parentNode) fly.remove()
				}, 650)
			})
		}
	})

	const modal = document.getElementById('ingredientsModal')
	const overlay = document.getElementById('modalOverlay')

	if (modal && overlay) {
		const closeAll = () => {
			modal.classList.remove('active')
			overlay.classList.remove('active')
			document.body.style.overflow = ''
		}

		overlay.addEventListener('click', closeAll)
		modal
			.querySelectorAll('.ingredients-modal__close')
			.forEach(btn => btn.addEventListener('click', closeAll))
		const apply = modal.querySelector('.ingredients-modal__apply')
		if (apply) apply.addEventListener('click', closeAll)

		document.addEventListener('keydown', e => {
			if (e.key === 'Escape' && modal.classList.contains('active')) closeAll()
		})
	}
})

document.addEventListener('DOMContentLoaded', () => {
	const tabButtons = document.querySelectorAll('.menu__tablinks')
	const tabContents = document.querySelectorAll('.menu__tabcontent')

	function showTab(category) {
		tabContents.forEach(card => {
			const categories = card.dataset.category.split(' ')
			if (categories.includes(category)) {
				card.style.display = 'block'
			} else {
				card.style.display = 'none'
			}
		})

		tabButtons.forEach(btn => {
			btn.classList.toggle('active-tab', btn.dataset.tab === category)
		})
	}

	tabButtons.forEach(btn => {
		btn.addEventListener('click', () => {
			showTab(btn.dataset.tab)
		})
	})

	showTab('all')
})

document.addEventListener('DOMContentLoaded', () => {
	const cartButton = document.getElementById('cart-button')
	const cartPopup = document.getElementById('cartPopup')
	const cartItemsContainer = document.querySelector('.cart-items')
	const totalPriceEl = document.querySelector('.total-price')
	const cartCount = document.querySelector('.cart-button__count')

	let cartItems = JSON.parse(localStorage.getItem('cart')) || []

	function updateCart() {
		if (cartItems.length > 0) {
			cartCount.style.display = 'inline-block'
			cartCount.textContent = cartItems.length
		} else {
			cartCount.style.display = 'none'
		}

		cartItemsContainer.innerHTML = ''

		cartItems.forEach((item, index) => {
			const itemEl = document.createElement('div')
			itemEl.className = 'cart-item'
			itemEl.innerHTML = `
        <img class="cart-item__img" src="${item.img}" alt="${
				item.name
			}" title="${item.ingredients}" />
        <div class="cart-item__info">
          <h4 class="cart-item__title">${item.name}</h4>
          <p class="cart-item__size">${item.size} cm</p>
        </div>
        <span class="cart-item__price">$${item.price.toFixed(2)}</span>
        <button class="remove-btn" data-index="${index}">×</button>
      `
			cartItemsContainer.appendChild(itemEl)
		})

		const total = cartItems.reduce((sum, item) => sum + item.price, 0)
		totalPriceEl.textContent = `$${total.toFixed(2)}`
		localStorage.setItem('cart', JSON.stringify(cartItems))
	}

	cartButton.addEventListener('click', () => {
		cartPopup.classList.toggle('active')
	})

	document.addEventListener('click', e => {
		if (!cartPopup.contains(e.target) && !cartButton.contains(e.target)) {
			cartPopup.classList.remove('active')
		}
	})

	cartItemsContainer.addEventListener('click', e => {
		if (e.target.classList.contains('remove-btn')) {
			const index = parseInt(e.target.dataset.index)
			cartItems.splice(index, 1)
			updateCart()
			e.stopPropagation()
		}
	})

	document.querySelectorAll('.menu__box-btn').forEach(btn => {
		btn.addEventListener('click', () => {
			const box = btn.closest('.menu__box')
			const title =
				box.querySelector('.menu__box-title')?.textContent || 'Pizza'

			const selectedRadio = box.querySelector(
				'.menu__box-size input[type="radio"]:checked'
			)
			const size = selectedRadio ? selectedRadio.value : '28'

			const ingredientsBtn = box.querySelector('.menu__box-ingredients')
			const ingredients =
				ingredientsBtn?.dataset.ingredients || 'No ingredients'

			const price = parseFloat(
				box.querySelector('.menu__price-value')?.textContent || '8.35'
			)
			const img =
				box.querySelector('.menu__img')?.src || 'images/img/pizza/Italian.webp'

			const item = {
				name: title,
				size: size,
				price: price,
				img: img,
				ingredients: ingredients,
				id: Date.now(),
			}

			const existingItem = cartItems.find(
				i => i.name === item.name && i.size === item.size
			)
			if (existingItem) {
				existingItem.price += price
			} else {
				cartItems.push(item)
			}

			updateCart()
		})
	})

	updateCart()
	const checkoutBtn = document.querySelector('.checkout-btn')
	const orderPopup = document.getElementById('orderPopup')
	const orderPizzaCount = document.getElementById('order-pizza-count')
	const orderEta = document.getElementById('order-eta')
	const orderTotalPrice = document.getElementById('order-total-price')
	const qrContainer = document.getElementById('qr-code-container')

	checkoutBtn?.addEventListener('click', () => {
		const cartPopup = document.getElementById('cartPopup')
		if (cartPopup) cartPopup.classList.remove('active')

		const count = cartItems.length
		const total = cartItems.reduce((sum, item) => sum + item.price, 0)

		orderPizzaCount.textContent = count
		orderTotalPrice.textContent = `$${total.toFixed(2)}`

		let eta = '30 min'
		if (count >= 6) eta = '60+ min'
		else if (count >= 3) eta = '45 min'
		orderEta.textContent = eta

		qrContainer.innerHTML = ''
		new QRCode(qrContainer, {
			text: `Order Total: $${total.toFixed(2)}`,
			width: 150,
			height: 150,
			colorDark: '#ff5924',
			colorLight: '#f8f8f8',
			correctLevel: QRCode.CorrectLevel.H,
		})

		orderPopup.classList.add('active')
		document.body.style.overflow = 'hidden' 
	})

	document.querySelector('.premium-close')?.addEventListener('click', () => {
		orderPopup.classList.remove('active')
		document.body.style.overflow = '' 
	})

	document.getElementById('orderForm')?.addEventListener('submit', e => {
		e.preventDefault()

		const formData = {
			firstName: document.getElementById('firstName').value,
			lastName: document.getElementById('lastName').value,
			district: document.getElementById('district').value,
			street: document.getElementById('street').value,
			house: document.getElementById('house').value,
			entrance: document.getElementById('entrance').value,
			code: document.getElementById('code').value,
			notes: document.getElementById('notes').value,
			total: orderTotalPrice.textContent,
		}

		setTimeout(() => {
			alert('Order Confirmed! Delivery en route.') 
			orderPopup.classList.remove('active')
			document.body.style.overflow = ''
		}, 1000)
	})

	orderPopup?.addEventListener('click', e => {
		if (e.target === orderPopup) {
			orderPopup.classList.remove('active')
			document.body.style.overflow = ''
		}
	})
})
