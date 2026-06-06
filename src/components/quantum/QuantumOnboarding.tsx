import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { QuantumIcon } from "@/components/QuantumIcon";
import { QuantumLogo } from "@/components/QuantumLogo";

const slides = [
  {
    icon: "brain",
    title: "Welcome to Quantum",
    body: "A calm space for thinking, coding, math, writing, and research.",
  },
  {
    icon: "more",
    title: "Tools stay close",
    body: "Attach files, search the web, add links, run code context, or use maps when the task needs it.",
  },
  {
    icon: "account",
    title: "Use your CheFu Account",
    body: "Sign in when you want your Quantum conversations synced through CheFu.",
  },
] as const;

export function QuantumOnboarding({
  visible,
  onDone,
}: {
  visible: boolean;
  onDone: () => void;
}) {
  const [index, setIndex] = useState(0);
  const slide = slides[index];
  const lastSlide = index === slides.length - 1;

  function continueFlow() {
    if (lastSlide) {
      onDone();
      return;
    }

    setIndex((current) => current + 1);
  }

  return (
    <Modal animationType="fade" visible={visible}>
      <LinearGradient colors={["#07111f", "#0d0f14"]} style={styles.root}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <QuantumLogo size={58} />
            <Text style={styles.brand}>Quantum</Text>
          </View>

          <View style={styles.hero}>
            <View style={styles.iconShell}>
              <QuantumIcon color="#8ab4f8" name={slide.icon} size={36} />
            </View>
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.body}>{slide.body}</Text>
          </View>

          <View style={styles.footer}>
            <View style={styles.dots}>
              {slides.map((item, dotIndex) => (
                <View
                  key={item.title}
                  style={[
                    styles.dot,
                    dotIndex === index && styles.activeDot,
                  ]}
                />
              ))}
            </View>
            <Pressable onPress={continueFlow} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>
                {lastSlide ? "Start chatting" : "Continue"}
              </Text>
            </Pressable>
            {!lastSlide ? (
              <Pressable onPress={onDone} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Skip</Text>
              </Pressable>
            ) : null}
          </View>
        </SafeAreaView>
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  activeDot: {
    backgroundColor: "#8ab4f8",
    width: 24,
  },
  body: {
    color: "#aab8d3",
    fontSize: 16,
    lineHeight: 24,
    marginTop: 14,
    maxWidth: 330,
    textAlign: "center",
  },
  brand: {
    color: "#f4f7fb",
    fontSize: 20,
    fontWeight: "900",
    marginTop: 14,
  },
  dot: {
    backgroundColor: "rgba(255, 255, 255, 0.24)",
    borderRadius: 999,
    height: 7,
    width: 7,
  },
  dots: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
    justifyContent: "center",
    marginBottom: 22,
  },
  footer: {
    paddingBottom: 18,
    paddingHorizontal: 22,
  },
  header: {
    alignItems: "center",
    paddingTop: 22,
  },
  hero: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  iconShell: {
    alignItems: "center",
    backgroundColor: "rgba(138, 180, 248, 0.12)",
    borderColor: "rgba(138, 180, 248, 0.28)",
    borderRadius: 28,
    borderWidth: 1,
    height: 86,
    justifyContent: "center",
    marginBottom: 28,
    width: 86,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#f4f7fb",
    borderRadius: 18,
    minHeight: 54,
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#0d0f14",
    fontSize: 16,
    fontWeight: "900",
  },
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  secondaryButton: {
    alignItems: "center",
    minHeight: 44,
    justifyContent: "center",
    marginTop: 8,
  },
  secondaryButtonText: {
    color: "#8a93a5",
    fontSize: 14,
    fontWeight: "800",
  },
  title: {
    color: "#f4f7fb",
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: 0,
    textAlign: "center",
  },
});
