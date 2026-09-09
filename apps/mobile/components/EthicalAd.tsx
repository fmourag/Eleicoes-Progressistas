import { View, Text, Pressable, Image, StyleSheet, Linking } from 'react-native';
import { useEffect, useState } from 'react';
import { api } from '../services/api';

interface Ad {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  targetUrl: string;
  advertiser: { name: string };
}

interface EthicalAdProps {
  screen: string;
  pillar?: string;
  format?: 'card' | 'banner' | 'PILAR_SPONSOR' | string;
}

export function EthicalAd({ screen, pillar, format = 'card' }: EthicalAdProps) {
  const [ad, setAd] = useState<Ad | null>(null);
  const [optedOut, setOptedOut] = useState(false);

  useEffect(() => {
    api.get<{ optedOut: boolean; ad: Ad | null }>('/api/ads/contextual', { params: { screen, pillar } })
      .then((res) => {
        if (res?.optedOut) setOptedOut(true);
        else setAd(res?.ad ?? null);
      })
      .catch(() => {}); // Falha silenciosa (anúncio não é crítico)
  }, [screen, pillar]);

  if (optedOut || !ad) return null;

  const handleAdClick = async () => {
    api.post(`/api/ads/click/${ad.id}`).catch(() => {});
    if (ad.targetUrl) {
      Linking.openURL(ad.targetUrl).catch(() => {});
    }
  };

  const isBanner = format === 'banner';
  const isPilarSponsor = format === 'PILAR_SPONSOR';

  if (isBanner) {
    return (
      <View style={styles.bannerContainer}>
        <View style={styles.bannerContent}>
          <View style={styles.badgeRow}>
            <Text style={styles.badge}>Apoio Cívico</Text>
            <Text style={styles.advertiserName} numberOfLines={1}>• {ad.advertiser.name}</Text>
          </View>
          <Text style={styles.bannerTitle} numberOfLines={1}>{ad.title}</Text>
          <Text style={styles.bannerDescription} numberOfLines={1}>{ad.description}</Text>
        </View>
        <Pressable onPress={handleAdClick} style={styles.bannerButton}>
          <Text style={styles.buttonText}>Conhecer</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, isPilarSponsor && styles.pilarSponsorContainer]}>
      <View style={styles.badgeRow}>
        <Text style={styles.badge}>{isPilarSponsor ? 'Apoio ao Pilar' : 'Apoio Cívico'}</Text>
        <Text style={styles.advertiserName}>• {ad.advertiser.name}</Text>
      </View>
      {ad.imageUrl && <Image source={{ uri: ad.imageUrl }} style={styles.image} />}
      <Text style={styles.title}>{ad.title}</Text>
      <Text style={styles.description}>{ad.description}</Text>
      <Pressable onPress={handleAdClick} style={styles.button}>
        <Text style={styles.buttonText}>Saiba mais</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginVertical: 10,
    marginHorizontal: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pilarSponsorContainer: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
    marginTop: 16,
    marginBottom: 8,
  },
  bannerContainer: {
    maxHeight: 80,
    height: 76,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 4,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerContent: {
    flex: 1,
    marginRight: 10,
    justifyContent: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  badge: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  advertiserName: {
    fontSize: 9,
    color: '#94A3B8',
    marginLeft: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  bannerTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  description: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 10,
    lineHeight: 18,
  },
  bannerDescription: {
    fontSize: 11,
    color: '#64748B',
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#0284C7',
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  bannerButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#0284C7',
    borderRadius: 6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
    textAlign: 'center',
  },
  image: {
    width: '100%',
    height: 120,
    borderRadius: 4,
    marginVertical: 8,
  },
});
