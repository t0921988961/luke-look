let gsapModule: Promise<typeof import("./gsap")> | null = null;

/** GSAP stays out of the first bundle; every island shares one lazily loaded copy. */
export function loadGsap() {
  gsapModule ??= import("./gsap");
  return gsapModule;
}
