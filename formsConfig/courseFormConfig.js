module.exports = () => {
  return {
    archivementConfig,
    featuresConfig,
    timelineConfig
  };
};
const archivementConfig = [1, 2, 3, 4, 5, 6].map(item => {
  return {
    for: `archivement_description_${item}`,
    label: `Archivements icon ${item}`,
    titleField: {
      type: "text",
      name: `archivement_title_${item}`,
      placeholder: `archivement title ${item}` || ""
    },
    fileField: {
      type: "file",
      name: `archivement_icon_${item}`
    },
    textField: {
      type: "text",
      name: `archivement_description_${item}`,
      placeholder: `archivement description ${item}` || ""
    }
  };
});

const featuresConfig = [1, 2, 3, 4, 5].map(item => {
  return {
    fileField: {
      type: "file",
      name: `features_icon_${item}`,
      for: `features${item}`,
      label: `Features icon ${item}`
    },
    textFieldTitle: {
      type: "text",
      name: `features_title_${item}`,
      placeholder: `features title ${item}` || "",
      for: `features_title_${item}`,
      label: `Features title ${item}`
    },
    textFieldSubtitle: {
      type: "text",
      name: `features_subtitle_${item}`,
      placeholder: `features subtitle ${item}` || "",
      for: `features_subtitle_${item}`,
      label: `Features subtitle ${item}`
    }
  };
});

const timelineConfig = [1, 2, 3, 4, 5].map(item => {
  return {
    title: {
      name: `timeline_title_${item}`,
      label: `timeline title ${item}` || ""
    },
    subtitle: {
      name: `timeline_subtitle_${item}`,
      label: `timeline subtitle ${item}` || ""
    },
    time: {
      name: `timeline_time_${item}`,
      label: `timeline time ${item}` || ""
    }
  };
});
