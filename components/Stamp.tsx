import StampIcon from './StampIcon';

/** One stamp: the business's own image (e.g. their logo) if set, otherwise a built-in icon. */
export default function Stamp({ icon, image, size = 22 }: { icon: string; image?: string; size?: number }) {
  if (image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img className="stamp-img" src={image} alt="" draggable={false} />;
  }
  return <StampIcon icon={icon} size={size} />;
}
