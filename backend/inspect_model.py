import tensorflow as tf
import os
from tensorflow.keras.layers import DepthwiseConv2D

# Fix for loading old models into new Keras
class FixedDepthwiseConv2D(DepthwiseConv2D):
    def __init__(self, **kwargs):
        if 'groups' in kwargs:
            kwargs.pop('groups')
        super().__init__(**kwargs)

model_path = "network.h5"
if os.path.exists(model_path):
    try:
        model = tf.keras.models.load_model(
            model_path, 
            custom_objects={'DepthwiseConv2D': FixedDepthwiseConv2D},
            compile=False
        )
        print(f"Model loaded successfully with patch.")
        print(f"Input shape: {model.input_shape}")
        print(f"Output shape: {model.output_shape}")
        num_classes = model.output_shape[-1]
        print(f"Number of classes: {num_classes}")
    except Exception as e:
        print(f"Error loading model: {e}")
else:
    print(f"Model file not found at {model_path}")
