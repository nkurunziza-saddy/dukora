## Complete Guide: cacheComponents + PPR + Suspense in Next.js 16

### What is `'use cache'`?

`'use cache'` is a compiler directive that tells Next.js to cache the output of a component, page, or function. Combined with **Partial Pre-Rendering (PPR)**, it enables your app to serve static cached content immediately while dynamic content loads asynchronously.

### Core Concepts

| Concept                         | Purpose                                       | Best For                                      |
| ------------------------------- | --------------------------------------------- | --------------------------------------------- |
| **PPR (Partial Pre-Rendering)** | Pre-render static parts, stream dynamic parts | Hybrid content (static header + dynamic feed) |
| **`'use cache'`**               | Cache entire component/function output        | Stable data, rarely changes                   |
| **`Suspense`**                  | Show fallback while loading                   | Dynamic, changing data                        |
| **`'use cache'` + `Suspense`**  | Cache the skeleton + data independently       | Smart caching with graceful loading           |

---

## Common Scenarios

### Scenario 1: Static Page (No Dynamic Data)

```typescriptreact
// app/about/page.tsx
'use cache'

export default function AboutPage() {
  return <div>This entire page is cached</div>
}
```

✅ **When:** Content never changes✅ **Result:** Pre-rendered at build time, served instantly

---

### Scenario 2: Dynamic Data with Caching

```typescriptreact
// app/dashboard/page.tsx
'use cache'

import { Suspense } from 'react'
import { getUserData } from '@/server/actions/user'

async function UserContent() {
  'use cache'
  const user = await getUserData()
  return <div>{user.name}</div>
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<UserSkeleton />}>
      <UserContent />
    </Suspense>
  )
}
```

✅ **When:** Data is stable but page structure is static✅ **Result:** Cache component output, serve skeleton immediately, hydrate with cached data

---

### Scenario 3: Streaming Multiple Sections (PPR)

```typescriptreact
// app/products/page.tsx
'use cache'

import { Suspense } from 'react'

export default function ProductsPage() {
  return (
    <main>
      <Header /> {/* Static, pre-rendered */}

      <Suspense fallback={<CategoriesSkeleton />}>
        <Categories /> {/* Cached, streams separately */}
      </Suspense>

      <Suspense fallback={<ProductsSkeleton />}>
        <ProductList /> {/* Dynamic, streams separately */}
      </Suspense>

      <Footer /> {/* Static, pre-rendered */}
    </main>
  )
}
```

✅ **When:** Multiple sections with different cache strategies✅ **Result:** Header + Footer pre-rendered, Categories cached, ProductList streams dynamically

---

### Scenario 4: Function-Level Caching

```typescriptreact
// lib/data.ts
'use cache'

export async function getCategories() {
  const categories = await db.query('categories')
  return categories
}

// app/store/page.tsx
'use cache'

import { getCategories } from '@/lib/data'
import { Suspense } from 'react'

async function CategoriesList() {
  const categories = await getCategories() // Cached function
  return categories.map(cat => <div key={cat.id}>{cat.name}</div>)
}

export default function StorePage() {
  return (
    <Suspense fallback={<CategoriesSkeleton />}>
      <CategoriesList />
    </Suspense>
  )
}
```

✅ **When:** Reusing the same data function across multiple pages✅ **Result:** Function output cached, shared across components

---

### Scenario 5: Selective Caching (Some Suspense Boundaries Don't Cache)

```typescriptreact
// app/feed/page.tsx
'use cache'

import { Suspense } from 'react'

async function CachedSection() {
  'use cache'
  const data = await stableData()
  return <div>{data}</div>
}

async function DynamicSection() {
  // NO 'use cache' - this rerenders frequently
  const data = await frequentlyChangingData()
  return <div>{data}</div>
}

export default function FeedPage() {
  return (
    <main>
      <Suspense fallback={<Skeleton />}>
        <CachedSection /> {/* Cached */}
      </Suspense>

      <Suspense fallback={<Skeleton />}>
        <DynamicSection /> {/* Not cached, always fresh */}
      </Suspense>
    </main>
  )
}
```

✅ **When:** Mixed static and dynamic content✅ **Result:** Stable sections cache, dynamic sections always fresh

---

## ️ Important Rules

1. **`'use cache'` must be at the top of the file** (before any imports except type imports)
2. **Cached components must be async** (otherwise caching doesn't apply)
3. **`Suspense` works with or without caching** - use it to show fallbacks during streaming
4. **Revalidation**: Cache persists until the page revalidates (on-demand or time-based)
5. **PPR requires cacheComponents enabled in next.config.js**:

```javascript
export default {
  cacheComponents: true,
};
```
