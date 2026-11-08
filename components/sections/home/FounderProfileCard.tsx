"use client";

import { useRouter } from "next/navigation";

import ProfileCard from "@/components/react-bits/ProfileCard";

export function FounderProfileCard() {
  const router = useRouter();

  return (
    <ProfileCard
      name="Cleiton Carvalho"
      title="Founder & Software Engineer"
      handle="cleitoncarvalho"
      status="Available"
      contactText="Contact"
      avatarUrl="/images/team/cleiton-profile.png"
      iconUrl=""
      backdropColor="#080B12"
      statusColor="#0A4EE4"
      holo={0.8}
      glare={0.5}
      tiltStrength={12}
      parallax={8}
      radius={16}
      enableTilt
      intro
      showUserInfo
      enableMobileTilt={false}
      theme="dark"
      onContactClick={() => router.push("/contact")}
    />
  );
}
