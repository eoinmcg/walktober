<template>
  <header class="container-fluid site-header">
    <h1 class="brand">
      <NuxtLink to="/">
        <!-- Rubber-stamp mark: a leaf with a trail of footprints under it -->
        <svg class="logo" viewBox="0 0 64 64" aria-hidden="true">
          <circle cx="32" cy="32" r="29" fill="none" stroke="currentColor" stroke-width="2.5" />
          <circle cx="32" cy="32" r="25" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="2 3" />
          <path d="M32 11 C45 17 49 31 32 44 C15 31 19 17 32 11 Z" fill="currentColor" />
          <path d="M32 44 V25 M32 37 L38 31 M32 31 L26 26" fill="none" stroke="var(--paper)" stroke-width="1.6"
            stroke-linecap="round" />
          <path d="M32 44 V48" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
          <path d="M19 52 C27 47 37 56 45 50" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"
            stroke-dasharray="0.1 6" />
        </svg>
        <span class="wordmark">Walktober</span>
        <small class="tagline">tracks & leaves</small>
      </NuxtLink>
    </h1>

    <nav aria-label="Main">
      <ul>
        <li>
          <NuxtLink to="/">Home</NuxtLink>
        </li>
        <li>
          <NuxtLink to="/quests">Quests</NuxtLink>
        </li>
      </ul>
    </nav>
  </header>
</template>
<style scoped>
.site-header {
  --paper: #fbf9f3;
  --ink: #2b2a33;
  --stamp: #c4351c;

  margin-top: -5px;
  padding-top: 5px;
  background: white;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem 2rem;
  padding-block: 1.25rem 1rem;
  margin-bottom: 1.5rem;
  /* a line of "stitching" under the header */
  border-bottom: 2px dashed color-mix(in srgb, var(--pico-color, #333) 35%, transparent);
}

/* ---------- Brand ---------- */
.site-header .brand {
  margin: 0;
  font-size: 1rem;
  /* reset Pico's big h1 */
  line-height: 1;
}

.site-header .brand a {
  display: grid;
  grid-template-columns: auto auto;
  grid-template-rows: auto auto;
  column-gap: 0.85rem;
  align-items: center;
  text-decoration: none;
  color: inherit;
}

.site-header .logo {
  grid-row: 1 / span 2;
  width: 3.4rem;
  height: 3.4rem;
  color: darkgreen;
  rotate: -8deg;
  opacity: 0.92;
  transition: all 0.3s cubic-bezier(0.3, 1.5, 0.5, 1);
}

.site-header .brand a:hover .logo,
.site-header .brand a:focus-visible .logo {
  rotate: 4deg;
  color: var(--stamp);
}

.site-header .wordmark {
  align-self: end;
  font-family: var(--font-hand);
  font-size: 2.5rem;
  font-weight: 600;
  line-height: 0.85;
}

.site-header .tagline {
  align-self: start;
  margin-top: 0.3rem;
  font-family: var(--font-type);
  font-size: 0.78rem;
  color: var(--pico-muted-color, #777);
}

/* ---------- Nav: paper slips ---------- */
.site-header nav ul {
  margin: 0;
  padding: 0;
  gap: 0.6rem;
}

.site-header nav li {
  padding: 0;
  list-style: none;
}

.site-header nav a {
  display: block;
  margin: 0;
  padding: 0.25rem 1rem 0.3rem;
  font-family: var(--font-hand);
  font-size: 1.6rem;
  font-weight: 600;
  line-height: 1.1;
  color: inherit;
  text-decoration: none;
  border-radius: 2px;
  transition: rotate 0.2s, background-color 0.2s, box-shadow 0.2s;
}

.site-header nav a:hover,
.site-header nav a:focus-visible {
  background: color-mix(in srgb, var(--pico-color, #333) 10%, transparent);
  rotate: -1.5deg;
}

/* current page: a paper slip stuck down */
.site-header nav a[aria-current="page"] {
  background: var(--paper);
  color: var(--ink);
  rotate: -2deg;
  box-shadow:
    0 0px 1px rgba(0, 0, 0, 0.25),
    0 5px 9px -2px rgba(0, 0, 0, 0.3);
}

.site-header nav li:nth-child(even) a[aria-current="page"] {
  rotate: 1.5deg;
}

/* ---------- Small screens ---------- */
@media (max-width: 520px) {
  .site-header {
    justify-content: center;
  }

  .site-header .wordmark {
    font-size: 2.1rem;
  }

  .site-header .logo {
    width: 2.9rem;
    height: 2.9rem;
  }
}

@media (prefers-reduced-motion: reduce) {

  .site-header .logo,
  .site-header nav a {
    transition: none;
  }
}
</style>
