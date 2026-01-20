# ClipSync Website Access Guide

## Website is Live! 🎉

Your ClipSync marketing website is now running and ready to view.

## How to Access

### Option 1: Direct URL (Recommended)
Visit this URL in your browser:
```
http://localhost:58655
```

### Option 2: Through Zo Computer
1. Open your Zo Computer app
2. Navigate to [Sites](/?t=sites)
3. Click on the `clipsync-website` service
4. Click the "Open" button to view the live site

### Option 3: View in New Browser Tab
```
/browser?url=http://localhost:58655
```

## Website Features

### Sections Included:

**1. Navigation Bar**
- ClipSync logo with gradient icon
- Links: Features, Platforms, Pricing, Testimonials
- Sign In / Get Started Free buttons
- Sticky navigation with blur effect

**2. Hero Section**
- Launch badge with "Now Available - Use LAUNCH50 for 50% Off"
- Headline: "Your clipboard, everywhere you need it"
- Subheadline about developer-focused clipboard manager
- Two CTAs: "Get Started Free" and "Download"
- Free forever message

**3. Features Section** (4 cards)
- Real-Time Sync
- Developer Tools (20+ transformations)
- Team Collaboration
- Enterprise Security

**4. Platforms Section** (4 cards)
- Desktop (Windows, Mac, Linux)
- Mobile (iOS, Android)
- Browser (Chrome, Firefox)
- IDEs (VS Code, Vim, Neovim)

**5. Pricing Section** (3 cards)
- Free ($0 forever): 1,000 clips, basic sync
- Pro ($9/month): Unlimited, all features (Most Popular badge)
- Team ($15/user/month): Collaboration features

**6. Testimonials Section** (3 testimonials)
- Sarah Chen - Engineering Lead at TechFlow
- Marcus Johnson - Senior Developer at ScaleUp
- Emily Rodriguez - Freelance Developer

**7. CTA Section**
- "Ready to transform your workflow?"
- Get Started Free / View Demo buttons
- Launch code reminder (LAUNCH50)

**8. Footer**
- ClipSync logo and tagline
- Social links (Twitter, GitHub, Discord)
- Product, Resources, Company links
- Copyright notice

## Design Highlights

**Color Scheme:**
- Primary: Blue gradient (`from-primary to-primary/60`)
- Backgrounds: Subtle gradients (`bg-muted/50`)
- Accents: Hover effects with primary color

**Typography:**
- Headings: Bold, tracking-tight
- Responsive sizes (5xl to 7xl)
- Clear hierarchy

**Interactive Elements:**
- Sticky navigation with backdrop blur
- Hover effects on all cards and links
- Smooth transitions
- Responsive buttons

**Responsiveness:**
- Mobile-first design
- Breakpoints for tablet and desktop
- Grid layouts that adapt

## Development Server

The website is running with:
- **Hot Reload Enabled**: Changes appear automatically
- **Port**: 58655
- **Status**: Development mode
- **Process**: bun run --hot server.ts

## How to Make Changes

### Quick Edits
1. Edit files in `/home/workspace/clipsync-website/src/`
2. Changes appear automatically (hot reload)
3. No need to restart server

### Main Files to Edit
- `/home/workspace/clipsync-website/src/pages/demos/marketing-demo.tsx` - Main landing page content
- `/home/workspace/clipsync-website/src/styles.css` - Global styles
- `/home/workspace/clipsync-website/src/App.tsx` - App routing

## Deployment

### To Deploy to Production

When ready to go live:

1. **Build the production version:**
   ```bash
   cd /home/workspace/clipsync-website
   bun run build
   ```

2. **Start production server:**
   ```bash
   bun run prod
   ```

3. **Access at:**
   - The site will be available via Zo's public URL
   - Check [Sites](/?t=sites) for the public URL

### Custom Domain

To add a custom domain:

1. Go to [Sites > Services](/?t=sites&s=services)
2. Click on `clipsync-website`
3. Expand details panel
4. Add custom domain in Custom Domains section
5. Requires paid plan (Basic: 3, Pro: 5, Ultra: 10 domains)

## Troubleshooting

### Website not loading?

**Check if server is running:**
```bash
ps aux | grep "bun.*58655"
```

**Check logs:**
```bash
tail -50 /dev/shm/clipsync-dev.log
```

**Restart server:**
```bash
cd /home/workspace/clipsync-website
bun run dev > /dev/shm/clipsync-dev.log 2>&1 &
```

### Changes not appearing?

**Clear browser cache** - Refresh with Ctrl+Shift+R (or Cmd+Shift+R on Mac)

**Check file saved correctly:**
```bash
grep "Your clipboard" /home/workspace/clipsync-website/src/pages/demos/marketing-demo.tsx
```

**Restart server:**
Kill process and start again (see above)

## Performance

The website is optimized for:
- **Fast Load**: Minimal JavaScript bundle
- **SEO Ready**: Semantic HTML structure
- **Accessible**: Proper ARIA labels
- **Mobile Friendly**: Responsive design

## Analytics

To add analytics:

1. Edit `/home/workspace/clipsync-website/src/pages/demos/marketing-demo.tsx`
2. Add analytics script in the useEffect or head
3. Track: Page views, button clicks, scroll depth

## Next Steps

1. **View the website** at http://localhost:58655
2. **Customize content** by editing the marketing-demo.tsx file
3. **Test all features** (navigation, buttons, responsiveness)
4. **Gather feedback** from team members
5. **Deploy to production** when ready
6. **Monitor analytics** after launch

## Support

**Need help?**
- Documentation: Check other files in `/home/workspace/ClipSync/marketing/`
- Technical: Review the code in `/home/workspace/clipsync-website/`
- Design: Refer to `BRAND-GUIDELINES.md`

---

**Ready to launch! 🚀**

Your ClipSync marketing website is live and ready to convert visitors into users!

---

*Last Updated: January 18, 2026*
*Version: 1.0.0*