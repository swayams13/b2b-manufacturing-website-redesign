// @vedanta/datum-ui — Datum Design System component library
// Build order per Datum §27: stamp → datum-rule → button → form fields →
// upload dropzone → spec table → cards → nav → footer → hero → trust

export { Stamp, type StampProps } from './components/Stamp'
export { Seal, type SealProps } from './components/Seal'
// ChevronDown: opened to the barrel 2026-07-17 so product-page FAQ accordions
// can use the shared §12 glyph instead of the platform-variable ⌄ text glyph.
export { ChevronDown } from './components/glyphs'
export { DatumRule, type DatumRuleProps } from './components/DatumRule'
// DimensionLabel: opened to the barrel 2026-07-16 (docs/decisions.md) so the
// group home's bespoke hero can reuse the exact §11 signature-moment label
// instead of re-implementing the count-up mechanic.
export { DimensionLabel, type DimensionLabelProps } from './components/DimensionLabel'
// DomainIcon: the §12 domain set as code (2026-07-16, docs/ui-ux-review.md §5
// P2 recommendation) — section-view icons for product cards until the works
// shoot supplies real photography.
export { DomainIcon, type DomainIconProps, type DomainIconName } from './components/DomainIcon'
export { Button, type ButtonProps } from './components/Button'
export { Input, type InputProps } from './components/Input'
export { Select, type SelectProps, type SelectOption } from './components/Select'
export { Textarea, type TextareaProps } from './components/Textarea'
export { ChoiceCard, type ChoiceCardProps } from './components/ChoiceCard'
export { UploadDropzone, type UploadDropzoneProps } from './components/UploadDropzone'
export {
  SpecTable,
  type SpecTableProps,
  type SpecTableRow,
  type SpecTableMatrixRow,
} from './components/SpecTable'
export {
  CapabilityEnvelopeTable,
  type CapabilityEnvelopeTableProps,
} from './components/CapabilityEnvelopeTable'
export { ProductCard, type ProductCardProps } from './components/ProductCard'
export { CategoryCard, type CategoryCardProps } from './components/CategoryCard'
export { IndustryCard, type IndustryCardProps } from './components/IndustryCard'
export { Breadcrumbs, type BreadcrumbsProps, type BreadcrumbItem } from './components/Breadcrumbs'
export {
  Header,
  type HeaderProps,
  type HeaderNavLink,
  type HeaderMenu,
  type MegaMenuGroup,
  type MegaMenuItem,
} from './components/Header'
export {
  MegaPanel,
  type MegaPanelProps,
  type MegaPanelColumn,
  type MegaPanelCategory,
  type MegaPanelProduct,
} from './components/MegaPanel'
export {
  MobileDrawer,
  type MobileDrawerProps,
  type DrawerGroup,
  type DrawerNavLink,
} from './components/MobileDrawer'
export { MobileBottomBar, type MobileBottomBarProps } from './components/MobileBottomBar'
export {
  Footer,
  type FooterProps,
  type FooterColumn,
  type FooterLink,
} from './components/Footer'
export { StatBand, type StatBandProps, type Stat } from './components/StatBand'
export { HomeHero, type HomeHeroProps, type HeroCta } from './components/HomeHero'
export { ProductHero, type ProductHeroProps } from './components/ProductHero'
export { PageHero, type PageHeroProps } from './components/PageHero'
export {
  CertificationCard,
  type CertificationCardProps,
} from './components/CertificationCard'
export { ApprovalsMatrix, type ApprovalsMatrixProps } from './components/ApprovalsMatrix'
export { ClientWall, type ClientWallProps } from './components/ClientWall'
export { Testimonial, type TestimonialProps } from './components/Testimonial'
export {
  ProjectCard,
  type ProjectCardProps,
  type ProjectMetric,
} from './components/ProjectCard'
export { useRfqAnchorInView } from './components/useRfqAnchorInView'
export {
  SpecRailMobile,
  SpecRailDesktop,
  type SpecRailProps,
  type SpecRailCta,
} from './components/SpecRail'
// Clients & Projects spec — the four new content components (§3)
export { SectorGrid, type SectorGridProps } from './components/SectorGrid'
export { ProjectRecordList, type ProjectRecordListProps } from './components/ProjectRecordList'
export { ApprovalWall, type ApprovalWallProps } from './components/ApprovalWall'
export { ClientLogoWall, type ClientLogoWallProps } from './components/ClientLogoWall'
export { ClientMarquee, type ClientMarqueeProps } from './components/ClientMarquee'
