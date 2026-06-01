import { StyleSheet, Text, View } from "react-native";

import { QuantumIcon } from "@/components/QuantumIcon";
import { summarizeActivities } from "@/lib/quantumPresentation";
import type { MessageToolActivity } from "@/types/quantum";

export function ActivityLog({ activities }: { activities: MessageToolActivity[] }) {
  return (
    <View style={styles.activityBox}>
      <View style={styles.activityHeader}>
        <QuantumIcon color="#8ab4f8" name="search" size={15} />
        <Text style={styles.activityTitle}>Work log</Text>
        <Text numberOfLines={1} style={styles.activitySummary}>
          {summarizeActivities(activities)}
        </Text>
      </View>
      {activities.slice(0, 3).map((activity, index) => (
        <View
          key={`${activity.type}-${activity.title}-${index}`}
          style={styles.activityItem}
        >
          <QuantumIcon
            color="#8ab4f8"
            name={activity.type === "code" ? "code" : "search"}
            size={14}
          />
          <View style={styles.activityTextBlock}>
            <Text numberOfLines={1} style={styles.activityItemTitle}>
              {activity.title}
            </Text>
            {activity.detail || activity.output ? (
              <Text numberOfLines={2} style={styles.activityDetail}>
                {activity.detail || activity.output}
              </Text>
            ) : null}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  activityBox: {
    backgroundColor: "rgba(100, 112, 132, 0.14)",
    borderColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
  },
  activityDetail: {
    color: "#8a93a5",
    fontSize: 11,
    lineHeight: 15,
  },
  activityHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
    marginBottom: 8,
  },
  activityItem: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 8,
    paddingVertical: 5,
  },
  activityItemTitle: {
    color: "#d6dbe6",
    fontSize: 12,
    fontWeight: "700",
  },
  activitySummary: {
    color: "#8a93a5",
    flex: 1,
    fontSize: 11,
  },
  activityTextBlock: {
    flex: 1,
  },
  activityTitle: {
    color: "#f4f7fb",
    fontSize: 12,
    fontWeight: "800",
  },
});
